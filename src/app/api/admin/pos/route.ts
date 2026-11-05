import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ensureDatabaseSchema, sanitizeJsonPayload } from '@/lib/dbInit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    await ensureDatabaseSchema();

    const body = await request.json();
    const { items, customerName, customerIdNumber, customerPhone, paymentMethod, paymentRef, totalVes, bcvRate } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'El carrito del Punto de Venta está vacío.' }, { status: 400 });
    }

    // Find or create a default POS / Admin user to attach the order
    let posUser = await prisma.user.findFirst({
      where: { role_id: 'Admin' },
    });

    if (!posUser) {
      posUser = await prisma.user.upsert({
        where: { email: 'pos@supplymax.local' },
        update: {},
        create: {
          name: 'Caja Principal (POS)',
          email: 'pos@supplymax.local',
          password: 'pos_internal_system',
          role_id: 'Admin',
        },
      });
    }

    // Calculate total USD
    let totalUSD = 0;
    for (const item of items) {
      totalUSD += (Number(item.price) || 0) * (Number(item.quantity) || 1);
    }

    const numTotalVes = totalVes ? Number(totalVes) : null;
    const numBcvRate = bcvRate ? Number(bcvRate) : null;

    // Create Order and decrement product stock in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const resolvedItems: Array<{ productId: number; quantity: number; price: number }> = [];

      for (const item of items) {
        const pId = Number(item.productId ?? item.id);
        const qty = Math.max(1, Number(item.quantity) || 1);
        const price = Number(item.price) || 0;

        const prod = await tx.product.findUnique({ where: { id: pId } });
        if (prod) {
          await tx.product.update({
            where: { id: pId },
            data: { stock: Math.max(0, (prod.stock || 0) - qty) },
          });
          resolvedItems.push({
            productId: pId,
            quantity: qty,
            price,
          });
        }
      }

      const createdOrder = await tx.order.create({
        data: {
          userId: posUser.id,
          total: Number.isFinite(totalUSD) ? totalUSD : 0,
          totalVes: numTotalVes !== null && Number.isFinite(numTotalVes) ? numTotalVes : null,
          bcvRate: numBcvRate !== null && Number.isFinite(numBcvRate) ? numBcvRate : null,
          customerName: customerName || 'Cliente Mostrador (POS)',
          customerIdNumber: customerIdNumber || 'N/A',
          customerPhone: customerPhone || 'N/A',
          status: 'COMPLETADA',
          agency: 'Punto de Venta Físico (Mostrador)',
          paymentRef: `POS:${paymentMethod || 'Efectivo'}${paymentRef ? ` - Ref: ${paymentRef}` : ''}`,
          items: {
            create: resolvedItems,
          },
        },
        include: {
          items: {
            include: { product: true },
          },
        },
      });

      return createdOrder;
    });

    return NextResponse.json(sanitizeJsonPayload(order), { status: 201 });
  } catch (error: any) {
    console.error('[API POS POST ERROR]:', error);
    return NextResponse.json(
      { error: `Error al procesar venta en POS: ${error?.message || 'Desconocido'}` },
      { status: 500 }
    );
  }
}
