import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: List all team / system users
export async function GET() {
  try {
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
          phone: true,
          idNumber: true,
          createdAt: true,
        },
        orderBy: [
          { role_id: 'asc' },
          { createdAt: 'desc' }
        ]
      });
    } catch (fallbackErr: any) {
      // Si la base de datos o Prisma Client tiene 'role' en lugar de 'role_id'
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
        orderBy: { createdAt: 'desc' }
      });
      users = rawUsers.map((u: any) => ({
        ...u,
        role_id: u.role_id || u.role || 'User'
      }));
    }

    return NextResponse.json({ users });
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
    const body = await request.json();
    const { name, email, password, role_id, role, status } = body;
    const finalRole = (role_id || role || 'Empleado').trim();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nombre, correo electrónico, contraseña y rol son requeridos.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: {
        email: {
          equals: normalizedEmail
        }
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe un usuario registrado con este correo electrónico.' },
        { status: 400 }
      );
    }

    // Create user in database with fallback for role_id vs role
    let newUser: any;
    try {
      newUser = await prisma.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          password: password.trim(),
          role_id: finalRole,
          status: status || 'Active',
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
        }
      });
    } catch (createErr: any) {
      if (createErr.message && (createErr.message.includes('role_id') || createErr.message.includes('Did you mean `role`'))) {
        newUser = await prisma.user.create({
          data: {
            name: name.trim(),
            email: normalizedEmail,
            password: password.trim(),
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
          } as any
        });
        newUser.role_id = finalRole;
      } else {
        throw createErr;
      }
    }

    return NextResponse.json(newUser, { status: 201 });
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
    const body = await request.json();
    const { id, role_id, role, status, name } = body;
    const finalRole = role_id || role;

    if (!id) {
      return NextResponse.json(
        { error: 'El ID de usuario es obligatorio.' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (finalRole) updateData.role_id = finalRole.trim();
    if (status) updateData.status = status;
    if (name) updateData.name = name.trim();

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
        }
      });
    } catch (patchErr: any) {
      if (patchErr.message && (patchErr.message.includes('role_id') || patchErr.message.includes('Did you mean `role`'))) {
        delete updateData.role_id;
        if (finalRole) updateData.role = finalRole.trim();
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
          } as any
        });
        updatedUser.role_id = finalRole || updatedUser.role_id;
      } else {
        throw patchErr;
      }
    }

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error('[API ADMIN TEAM PATCH ERROR]:', error);
    return NextResponse.json(
      { error: `Error al actualizar el usuario: ${error.message || 'Desconocido'}` },
      { status: 500 }
    );
  }
}

// DELETE: Remove a user
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'El ID del usuario es requerido.' },
        { status: 400 }
      );
    }

    // Check if target user is protected admin
    const targetUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado.' },
        { status: 404 }
      );
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

    await prisma.user.delete({
      where: { id }
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
