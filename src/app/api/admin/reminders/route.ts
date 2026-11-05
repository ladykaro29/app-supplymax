import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ensureDatabaseSchema, sanitizeJsonPayload } from '@/lib/dbInit';

export async function GET() {
  try {
    await ensureDatabaseSchema();

    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: ['VERIFICADO', 'COMPLETADA', 'ENTREGADO', 'ENVIADO'],
        },
      },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    const now = new Date();
    const alerts: any[] = [];

    orders.forEach((order) => {
      const orderDate = new Date(order.createdAt);
      const diffTime = Math.abs(now.getTime() - orderDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      (order.items || []).forEach((item) => {
        const rawDuration = item.product?.durationInDays;
        const duration = parseInt(rawDuration || '0', 10);

        if (duration > 0) {
          const daysRemaining = duration - diffDays;

          // Alert if 5 days or fewer are left (or up to 10 days overdue)
          if (daysRemaining <= 5 && daysRemaining >= -10) {
            alerts.push({
              orderId: order.id,
              userName: order.customerName || order.user?.name || 'Cliente SupplyMax',
              userEmail: order.customerEmail || order.user?.email || '',
              productName: item.product?.name || 'Suplemento',
              purchaseDate: order.createdAt,
              daysRemaining,
              status: daysRemaining <= 0 ? 'EXPIRADO' : 'PRÓXIMO A AGOTARSE',
            });
          }
        }
      });
    });

    return NextResponse.json(sanitizeJsonPayload(alerts));
  } catch (error) {
    console.error('[REMINDERS ERROR]:', error);
    return NextResponse.json({ error: 'Error al procesar recordatorios' }, { status: 500 });
  }
}
