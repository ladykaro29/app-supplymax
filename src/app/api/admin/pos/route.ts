import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, customerName, customerIdNumber, customerPhone, customerEmail, paymentMethod, paymentRef, totalVes, bcvRate } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Debe incluir al menos un producto en la venta POS.' }, { status: 400 });
    }

    // Calculate total
    let total = 0;
    items.forEach((item: any) => {
      total += (Number(item.price) || 0) * (Number(item.quantity) || 1);
    });

    // Find default system/admin user or customer for POS
    let posUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'admin@supplymax.app' },
          { email: 'admin@supplymax.com' },
        ]
      }
    });

    if (!posUser) {
      posUser = await prisma.user.findFirst();
    }

    if (!posUser) {
      return NextResponse.json({ error: 'No se encontró un usuario base en el sistema para asociar la venta POS.' }, { status: 500 });
    }

    // Create Order
    const newOrder = await prisma.order.create({
      data: {
        userId: posUser.id,
        total,
        totalVes: totalVes ? Number(totalVes) : null,
        bcvRate: bcvRate ? Number(bcvRate) : null,
        customerName: customerName ? customerName.trim() : 'Cliente POS (Mostrador)',
        customerIdNumber: customerIdNumber ? customerIdNumber.trim() : 'V-00000000',
        customerPhone: customerPhone ? customerPhone.trim() : 'N/A',
        customerEmail: customerEmail ? customerEmail.trim() : 'pos@supplymax.app',
        status: 'COMPLETADA',
        agency: 'Punto de Venta Físico / Mostrador',
        paymentRef: paymentRef ? `${paymentMethod || 'POS'}: ${paymentRef}` : `POS: ${paymentMethod || 'Efectivo / Pago Móvil'}`,
        items: {
          create: items.map((item: any) => ({
            productId: Number(item.productId),
            quantity: Number(item.quantity),
            price: Number(item.price),
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Deduct stock for sold products
    for (const item of items) {
      try {
        await prisma.product.update({
          where: { id: Number(item.productId) },
          data: {
            stock: {
              decrement: Number(item.quantity)
            }
          }
        });
      } catch (stockErr) {
        console.warn(`Could not decrement stock for product ${item.productId}:`, stockErr);
      }
    }

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error: any) {
    console.error('POS order creation error:', error);
    return NextResponse.json({ error: `Error al procesar venta POS: ${error.message}` }, { status: 500 });
  }
}
