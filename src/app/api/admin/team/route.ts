import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ensureDatabaseSchema, sanitizeJsonPayload } from '@/lib/dbInit';

export const dynamic = 'force-dynamic';

// GET: List all team / system users
export async function GET() {
  try {
    await ensureDatabaseSchema();

    let users: any[] = [];
    try {
      users = await prisma.user.findMany({
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
        orderBy: [{ role_id: 'asc' }, { createdAt: 'desc' }],
      });
    } catch {
      const rawUsers = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          level: true,
          phone: true,
          idNumber: true,
          createdAt: true,
        } as any,
        orderBy: { createdAt: 'desc' },
      });
      users = rawUsers.map((u: any) => ({
        ...u,
        role_id: u.role_id || u.role || 'User',
      }));
    }

    return NextResponse.json(sanitizeJsonPayload({ users }));
  } catch (error: any) {
    console.error('[API ADMIN TEAM GET ERROR]:', error);
    return NextResponse.json(
      { error: `Error al obtener el equipo: ${error.message || 'Desconocido'}` },
      { status: 500 }
    );
  }
}

// POST: Create a new user with a specific role and password
export async function POST(request: Request) {
  try {
    await ensureDatabaseSchema();

    const body = await request.json();
    const { name, email, password, role_id, role, status, phone, idNumber } = body;
    const finalRole = (role_id || role || 'Empleado').trim();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nombre, correo electrónico, contraseña y rol son requeridos.' },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const existing = await prisma.user.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe un usuario registrado con este correo electrónico.' },
        { status: 400 }
      );
    }

    let newUser: any;
    try {
      newUser = await prisma.user.create({
        data: {
          name: String(name).trim(),
          email: normalizedEmail,
          password: String(password).trim(),
          role_id: finalRole,
          status: status || 'Active',
          phone: phone ? String(phone).trim() : null,
          idNumber: idNumber ? String(idNumber).trim() : null,
        } as any,
        select: {
          id: true,
          name: true,
          email: true,
          role_id: true,
          status: true,
          level: true,
          phone: true,
          idNumber: true,
          createdAt: true,
        },
      });
    } catch (createErr: any) {
      if (
        createErr.message &&
        (createErr.message.includes('role_id') || createErr.message.includes('Did you mean `role`'))
      ) {
        newUser = await prisma.user.create({
          data: {
            name: String(name).trim(),
            email: normalizedEmail,
            password: String(password).trim(),
            role: finalRole,
            status: status || 'Active',
          } as any,
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
            level: true,
            phone: true,
            idNumber: true,
            createdAt: true,
          } as any,
        });
        newUser.role_id = finalRole;
      } else {
        throw createErr;
      }
    }

    return NextResponse.json(sanitizeJsonPayload(newUser), { status: 201 });
  } catch (error: any) {
    console.error('[API ADMIN TEAM POST ERROR]:', error);
    return NextResponse.json(
      { error: `Error al crear el usuario: ${error.message || 'Desconocido'}` },
      { status: 500 }
    );
  }
}

// PATCH: Update user role or status
export async function PATCH(request: Request) {
  try {
    await ensureDatabaseSchema();

    const body = await request.json();
    const { id, role_id, role, status, name } = body;
    const finalRole = role_id || role;

    if (!id) {
      return NextResponse.json({ error: 'El ID de usuario es obligatorio.' }, { status: 400 });
    }

    const updateData: any = {};
    if (finalRole) updateData.role_id = String(finalRole).trim();
    if (status) updateData.status = status;
    if (name) updateData.name = String(name).trim();

    let updatedUser: any;
    try {
      updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          role_id: true,
          status: true,
          level: true,
          phone: true,
          idNumber: true,
          createdAt: true,
        },
      });
    } catch (patchErr: any) {
      if (
        patchErr.message &&
        (patchErr.message.includes('role_id') || patchErr.message.includes('Did you mean `role`'))
      ) {
        delete updateData.role_id;
        if (finalRole) updateData.role = String(finalRole).trim();
        updatedUser = await prisma.user.update({
          where: { id },
          data: updateData,
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
            level: true,
            phone: true,
            idNumber: true,
            createdAt: true,
          } as any,
        });
        updatedUser.role_id = finalRole || updatedUser.role_id;
      } else {
        throw patchErr;
      }
    }

    return NextResponse.json(sanitizeJsonPayload(updatedUser));
  } catch (error: any) {
    console.error('[API ADMIN TEAM PATCH ERROR]:', error);
    return NextResponse.json(
      { error: `Error al actualizar el usuario: ${error.message || 'Desconocido'}` },
      { status: 500 }
    );
  }
}

// DELETE: Remove a user safely (cleaning up related records)
export async function DELETE(request: Request) {
  try {
    await ensureDatabaseSchema();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'El ID del usuario es requerido.' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
    }

    if (
      targetUser.email.toLowerCase() === 'admin@supplymax.app' ||
      targetUser.email.toLowerCase() === 'admin@supplymax.com'
    ) {
      return NextResponse.json(
        { error: 'No se puede eliminar la cuenta de Administrador Principal del sistema.' },
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

    return NextResponse.json({ success: true, message: 'Usuario eliminado correctamente.' });
  } catch (error: any) {
    console.error('[API ADMIN TEAM DELETE ERROR]:', error);
    return NextResponse.json(
      { error: `Error al eliminar el usuario: ${error.message || 'Desconocido'}` },
      { status: 500 }
    );
  }
}
