import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ensureDatabaseSchema, sanitizeJsonPayload } from '@/lib/dbInit';

export async function GET() {
  try {
    await ensureDatabaseSchema();

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            idNumber: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
                category: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(sanitizeJsonPayload({ orders }));
  } catch (error) {
    console.error('[ADMIN ORDERS GET ERROR]:', error);
    return NextResponse.json({ error: 'Error al obtener los pedidos' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await ensureDatabaseSchema();

    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'ID y estado son requeridos' }, { status: 400 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(sanitizeJsonPayload(updatedOrder));
  } catch (error) {
    console.error('[ADMIN ORDERS PATCH ERROR]:', error);
    return NextResponse.json({ error: 'Error al actualizar el pedido' }, { status: 500 });
  }
}
