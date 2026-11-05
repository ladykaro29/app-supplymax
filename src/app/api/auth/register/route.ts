import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ensureDatabaseSchema, sanitizeJsonPayload } from '@/lib/dbInit';

export async function POST(request: Request) {
  try {
    await ensureDatabaseSchema();

    const body = await request.json();
    const { name, email, password, role_id, phone, idNumber, newsletter } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Todos los campos son obligatorios' }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 400 });
    }

    let user: any;
    try {
      user = await prisma.user.create({
        data: {
          name: String(name).trim(),
          email: normalizedEmail,
          password: String(password),
          phone: phone ? String(phone).trim() : null,
          idNumber: idNumber ? String(idNumber).trim() : null,
          newsletter: typeof newsletter === 'boolean' ? newsletter : true,
          role_id: role_id || 'User',
          status: role_id === 'Coach' || role_id === 'Influencer' ? 'Pending' : 'Active',
        },
      });
    } catch (innerErr: any) {
      console.warn('[REGISTER FALLBACK] Retrying with minimal user fields:', innerErr?.message);
      user = await prisma.user.create({
        data: {
          name: String(name).trim(),
          email: normalizedEmail,
          password: String(password),
          role_id: role_id || 'User',
          status: role_id === 'Coach' || role_id === 'Influencer' ? 'Pending' : 'Active',
        },
      });
    }

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(sanitizeJsonPayload(userWithoutPassword));
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error?.message || 'Error en el servidor al registrar' },
      { status: 500 }
    );
  }
}
