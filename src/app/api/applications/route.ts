import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const type = formData.get('type') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const instagram = formData.get('instagram') as string;
    const tiktok = formData.get('tiktok') as string;
    const affiliatesCountStr = formData.get('affiliatesCount') as string;
    const degreesFile = formData.get('degrees') as File | null;

    let degreesPath = '';

    // Handle File Upload if present
    if (degreesFile && degreesFile.size > 0) {
      const fileName = `${Date.now()}_${degreesFile.name.replace(/\s+/g, '_')}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'applications');
      
      // Ensure directory exists
      await fs.mkdir(uploadDir, { recursive: true });
      
      const filePath = path.join(uploadDir, fileName);
      const buffer = Buffer.from(await degreesFile.arrayBuffer());
      await fs.writeFile(filePath, buffer);
      
      degreesPath = `/uploads/applications/${fileName}`;
    }

    const application = await prisma.application.create({
      data: {
        type,
        firstName,
        lastName,
        email,
        phone,
        instagram,
        tiktok,
        affiliatesCount: affiliatesCountStr ? parseInt(affiliatesCountStr) : null,
        degrees: degreesPath,
        status: 'PENDIENTE'
      }
    });

    // Real Email Notification via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: 'SupplyMax <onboarding@resend.dev>',
          to: 'suplygym.08@gmail.com',
          subject: `NUEVA SOLICITUD: ${type.toUpperCase()}`,
          html: `
            <h1>Nueva Solicitud de Equipo</h1>
            <p><strong>Tipo:</strong> ${type}</p>
            <p><strong>Nombre:</strong> ${firstName} ${lastName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Teléfono:</strong> ${phone}</p>
            <p><strong>Instagram:</strong> ${instagram}</p>
            <p><strong>TikTok:</strong> ${tiktok || 'N/A'}</p>
            ${affiliatesCountStr ? `<p><strong>Alumnos/Afiliados:</strong> ${affiliatesCountStr}</p>` : ''}
            ${degreesPath ? `<p><strong>Títulos:</strong> <a href="https://supplymax.app${degreesPath}">Ver Documento</a></p>` : ''}
            <br/>
            <p>Gestiona esta solicitud en el panel de administración.</p>
          `
        });
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
      }
    }

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const applications = await prisma.application.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(applications);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}
