import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Fetch all orders for admin management
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');
    const search = searchParams.get('search')?.toLowerCase().trim();

    const whereClause: any = {};

    if (statusFilter && statusFilter !== 'ALL') {
      whereClause.status = statusFilter;
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            idNumber: true,
          }
        },
        items: {
          include: {
            product: true
          }
        }
      }
    });

    let filteredOrders = orders;
    if (search) {
      filteredOrders = orders.filter((o: any) => {
        const idMatch = o.id.toLowerCase().includes(search);
        const nameMatch = (o.customerName || o.user?.name || '').toLowerCase().includes(search);
        const emailMatch = (o.customerEmail || o.user?.email || '').toLowerCase().includes(search);
        const refMatch = (o.paymentRef || '').toLowerCase().includes(search);
        const phoneMatch = (o.customerPhone || o.user?.phone || '').toLowerCase().includes(search);
        return idMatch || nameMatch || emailMatch || refMatch || phoneMatch;
      });
    }

    return NextResponse.json({ orders: filteredOrders });
  } catch (error: any) {
    console.error('[API ADMIN ORDERS GET ERROR]:', error);
    return NextResponse.json(
      { error: `Error al obtener pedidos: ${error.message || 'Desconocido'}` },
      { status: 500 }
    );
  }
}

// PATCH: Update order status
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID de pedido y nuevo estado son obligatorios' },
        { status: 400 }
      );
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        },
        items: {
          include: {
            product: true
          }
        }
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('[API ADMIN ORDERS PATCH ERROR]:', error);
    return NextResponse.json(
      { error: `Error al actualizar estado del pedido: ${error.message || 'Desconocido'}` },
      { status: 500 }
    );
  }
}
