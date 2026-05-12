import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    console.log(`[LOGIN ATTEMPT] Email: ${normalizedEmail}`);

    const user = await prisma.user.findFirst({
      where: { 
        email: {
          equals: normalizedEmail
        }
      },
      include: {
        addresses: true,
      },
    });

    if (!user) {
      console.log(`[LOGIN FAILED] User not found for email: ${normalizedEmail}`);
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // WARNING: In production use bcrypt.compare()
    if (user.password !== password) {
      console.log(`[LOGIN FAILED] Incorrect password for email: ${normalizedEmail}`);
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    console.log(`[LOGIN SUCCESS] User logged in: ${normalizedEmail}`);
    return NextResponse.json(userWithoutPassword);
  } catch (error: any) {
    console.error('[LOGIN ERROR]:', error);
    return NextResponse.json({ error: `Error en el servidor: ${error.message || 'Error desconocido'}` }, { status: 500 });
  }
}
