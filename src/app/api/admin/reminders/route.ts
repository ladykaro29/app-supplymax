import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Find all users who have orders
    const orders = await prisma.order.findMany({
      where: {
        status: 'VERIFICADO', // Only consider confirmed orders
      },
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
      },
      orderBy: { createdAt: 'desc' }
    });

    const now = new Date();
    const reminders: any[] = [];

    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.product.durationInDays) {
          const duration = parseInt(item.product.durationInDays);
          const purchaseDate = new Date(order.createdAt);
          const depletionDate = new Date(purchaseDate);
          depletionDate.setDate(purchaseDate.getDate() + duration);

          // If depletion is within 7 days from now, or already depleted
          const diffDays = Math.ceil((depletionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          if (diffDays <= 7) {
            reminders.push({
              userName: order.user.name,
              userEmail: order.user.email,
              productName: item.product.name,
              purchaseDate: order.createdAt,
              depletionDate,
              daysRemaining: diffDays,
              status: diffDays < 0 ? 'AGOTADO' : 'POR AGOTARSE'
            });
          }
        }
      });
    });

    return NextResponse.json(reminders);
  } catch (error) {
    console.error('Reminders API error:', error);
    return NextResponse.json({ error: 'Error al obtener recordatorios' }, { status: 500 });
  }
}
