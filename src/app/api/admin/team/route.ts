import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: List all team / system users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
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
    const { name, email, password, role_id, status } = body;

    if (!name || !email || !password || !role_id) {
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

    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: password.trim(),
        role_id: role_id.trim(),
        status: status || 'Active',
      },
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
    const { id, role_id, status, name } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'El ID de usuario es obligatorio.' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (role_id) updateData.role_id = role_id.trim();
    if (status) updateData.status = status;
    if (name) updateData.name = name.trim();

    const updatedUser = await prisma.user.update({
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
