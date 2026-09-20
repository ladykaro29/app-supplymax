import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const {
      userId,
      items,
      total,
      totalVes,
      bcvRate,
      customerName,
      customerIdNumber,
      customerPhone,
      customerEmail,
      referralCode,
      agency,
      paymentRef,
    } = await request.json();

    if (!userId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Datos de pedido incompletos' }, { status: 400 });
    }

    // Affiliate & Token Logic
    let finalTotal = total;
    let referrerId: string | null = null;

    if (referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { affiliate_code: referralCode }
      });

      if (referrer) {
        referrerId = referrer.id;
      }
    }

    // Create order and update tokens in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // 1. Create the order
      const newOrder = await tx.order.create({
        data: {
          userId,
          total: finalTotal,
          totalVes: totalVes ? parseFloat(String(totalVes)) : null,
          bcvRate: bcvRate ? parseFloat(String(bcvRate)) : null,
          customerName: customerName || null,
          customerIdNumber: customerIdNumber || null,
          customerPhone: customerPhone || null,
          customerEmail: customerEmail || null,
          referralCode,
          agency,
          paymentRef,
          status: 'PENDIENTE',
          items: {
            create: items.map((item: any) => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true
            }
          },
        },
      });

      // 2. Award tokens to affiliate if applicable
      if (referrerId) {
        const commission = finalTotal * 0.05;
        await tx.user.update({
          where: { id: referrerId },
          data: { tokens: { increment: commission } }
        });
      }

      // 3. Update user profile with phone / idNumber if missing
      if (customerPhone || customerIdNumber || customerName) {
        await tx.user.update({
          where: { id: userId },
          data: {
            ...(customerPhone ? { phone: customerPhone } : {}),
            ...(customerIdNumber ? { idNumber: customerIdNumber } : {}),
            ...(customerName ? { name: customerName } : {}),
          },
        }).catch(() => null);
      }

      return newOrder;
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Error al procesar el pedido' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'UserId es requerido' }, { status: 400 });
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true
          }
        },
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({ error: 'Error al obtener pedidos' }, { status: 500 });
  }
}
