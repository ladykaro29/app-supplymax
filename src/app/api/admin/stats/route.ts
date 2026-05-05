import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
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

    const totalSalesUSD = orders.reduce((sum, order) => sum + order.total, 0);
    const pendingOrdersCount = orders.filter(o => o.status === 'PENDIENTE').length;

    return NextResponse.json({
      orders,
      totalSalesUSD,
      pendingOrdersCount
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Error al obtener estadísticas' }, { status: 500 });
  }
}
