import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { ensureDatabaseSchema, sanitizeJsonPayload } from '@/lib/dbInit';

export async function POST(request: Request) {
  try {
    await ensureDatabaseSchema();

    const body = await request.json();
    const { name, email, password, role_id, phone, idNumber, newsletter } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'El correo electrónico ya está registrado' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    let user: any;
    try {
      user = await prisma.user.create({
        data: {
          name: String(name).trim(),
          email: normalizedEmail,
          password: hashedPassword,
          role_id: role_id || 'User',
          phone: phone ? String(phone).trim() : null,
          idNumber: idNumber ? String(idNumber).trim() : null,
          newsletter: newsletter !== undefined ? Boolean(newsletter) : true,
          status: role_id === 'Coach' || role_id === 'Influencer' ? 'Pending' : 'Active',
        },
      });
    } catch (innerErr: any) {
      console.warn('[REGISTER FALLBACK] Retrying with minimal user fields:', innerErr?.message);
      user = await prisma.user.create({
        data: {
          name: String(name).trim(),
          email: normalizedEmail,
          password: hashedPassword,
          role_id: role_id || 'User',
          status: role_id === 'Coach' || role_id === 'Influencer' ? 'Pending' : 'Active',
        },
      });
    }

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(sanitizeJsonPayload(userWithoutPassword));
  } catch (error: any) {
    console.error('[REGISTER ERROR]:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al registrar usuario' },
      { status: 500 }
    );
  }
}
