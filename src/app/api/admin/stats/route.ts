import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ensureDatabaseSchema, sanitizeJsonPayload } from '@/lib/dbInit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await ensureDatabaseSchema();

    // 1. Total Revenue (excluding cancelled orders)
    const totalSalesResult = await prisma.order.aggregate({
      where: {
        status: {
          not: 'CANCELADO',
        },
      },
      _sum: {
        total: true,
      },
    });
    const totalSalesUSD = totalSalesResult._sum.total || 0;

    // 2. Count Pending Orders
    const pendingOrdersCount = await prisma.order.count({
      where: { status: 'PENDIENTE' },
    });

    // 3. Top Selling Product
    const orderItems = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 1,
    });

    let topProductName = 'Ninguno aún';
    if (orderItems.length > 0) {
      const topProduct = await prisma.product.findUnique({
        where: { id: orderItems[0].productId },
      });
      if (topProduct) {
        topProductName = `${topProduct.name} (${orderItems[0]._sum.quantity} uds)`;
      }
    }

    // 4. Recent Orders List (including items and customer info)
    const recentOrders = await prisma.order.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true, role_id: true, phone: true, idNumber: true },
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, price: true, purchasePrice: true },
            },
          },
        },
      },
    });

    // 5. Recent Users / Affiliates
    const users = await prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role_id: true,
        status: true,
        tokens: true,
        level: true,
        sub_level: true,
      },
    });

    return NextResponse.json(
      sanitizeJsonPayload({
        totalSalesUSD,
        pendingOrdersCount,
        topProductName,
        orders: recentOrders,
        users,
      })
    );
  } catch (error) {
    console.error('[Dashboard Stats Error]:', error);
    return NextResponse.json({ error: 'Error al cargar estadísticas' }, { status: 500 });
  }
}
