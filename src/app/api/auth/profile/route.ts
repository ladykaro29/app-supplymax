import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ensureDatabaseSchema, sanitizeJsonPayload } from '@/lib/dbInit';

export async function GET(request: Request) {
  try {
    await ensureDatabaseSchema();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'UserId requerido' }, { status: 400 });
    }

    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: true,
      },
    });

    if (!user && userId === 'admin-fallback-001') {
      user = await prisma.user.findUnique({
        where: { email: 'admin@supplymax.app' },
        include: { addresses: true },
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(sanitizeJsonPayload(userWithoutPassword));
  } catch (error) {
    console.error('[PROFILE GET ERROR]:', error);
    return NextResponse.json({ error: 'Error al obtener perfil' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await ensureDatabaseSchema();

    const { userId, name, phone, idNumber, newsletter } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'UserId requerido' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name ? { name: String(name).trim() } : {}),
        ...(phone !== undefined ? { phone: phone ? String(phone).trim() : null } : {}),
        ...(idNumber !== undefined ? { idNumber: idNumber ? String(idNumber).trim() : null } : {}),
        ...(newsletter !== undefined ? { newsletter: Boolean(newsletter) } : {}),
      },
      include: {
        addresses: true,
      },
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    return NextResponse.json(sanitizeJsonPayload(userWithoutPassword));
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Error al actualizar perfil' }, { status: 500 });
  }
}
