import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { ensureDatabaseSchema, sanitizeJsonPayload } from '@/lib/dbInit';

export async function GET() {
  try {
    await ensureDatabaseSchema();

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role_id: true,
        status: true,
        level: true,
        sub_level: true,
        phone: true,
        idNumber: true,
        createdAt: true,
      },
    });

    return NextResponse.json(sanitizeJsonPayload({ users }));
  } catch (error) {
    console.error('[TEAM GET ERROR]:', error);
    return NextResponse.json({ error: 'Error al obtener la lista de usuarios' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDatabaseSchema();

    const body = await request.json();
    const { name, email, password, role_id, status, phone, idNumber } = body;

    if (!name || !email || !password || !role_id) {
      return NextResponse.json(
        { error: 'Por favor completa Nombre, Correo, Contraseña y Rol.' },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este correo electrónico ya está registrado en el sistema.' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    const newUser = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role_id: String(role_id).trim(),
        status: status || 'Active',
        phone: phone ? String(phone).trim() : null,
        idNumber: idNumber ? String(idNumber).trim() : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role_id: true,
        status: true,
        phone: true,
        idNumber: true,
        createdAt: true,
      },
    });

    return NextResponse.json(sanitizeJsonPayload(newUser), { status: 201 });
  } catch (error) {
    console.error('[TEAM POST ERROR]:', error);
    return NextResponse.json({ error: 'Error interno al crear el usuario' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureDatabaseSchema();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 400 });
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    if (
      target.email.toLowerCase() === 'admin@supplymax.app' ||
      target.email.toLowerCase() === 'admin@supplymax.com'
    ) {
      return NextResponse.json(
        { error: 'No se puede eliminar la cuenta de Administrador Principal' },
        { status: 403 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.address.deleteMany({ where: { userId: id } });
      await tx.review.deleteMany({ where: { userId: id } });
      const userOrders = await tx.order.findMany({ where: { userId: id }, select: { id: true } });
      if (userOrders.length > 0) {
        const orderIds = userOrders.map((o) => o.id);
        await tx.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
        await tx.order.deleteMany({ where: { userId: id } });
      }
      await tx.user.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[TEAM DELETE ERROR]:', error);
    return NextResponse.json({ error: 'Error al eliminar el usuario' }, { status: 500 });
  }
}
