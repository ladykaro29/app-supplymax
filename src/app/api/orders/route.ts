import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ensureDatabaseSchema, sanitizeJsonPayload } from '@/lib/dbInit';

export async function GET(request: Request) {
  try {
    await ensureDatabaseSchema();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'UserId requerido' }, { status: 400 });
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(sanitizeJsonPayload(orders));
  } catch (error) {
    console.error('[GET /api/orders ERROR]:', error);
    return NextResponse.json({ error: 'Error al obtener pedidos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDatabaseSchema();

    const body = await request.json();
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
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío o los datos son incompletos' }, { status: 400 });
    }

    // 1. Ensure a valid User exists in SQLite so foreign key Order_userId_fkey never fails
    let resolvedUserId = userId ? String(userId) : '';
    let existingUser = resolvedUserId
      ? await prisma.user.findUnique({ where: { id: resolvedUserId } })
      : null;

    if (!existingUser && customerEmail) {
      existingUser = await prisma.user.findUnique({
        where: { email: String(customerEmail).trim().toLowerCase() },
      });
    }

    if (!existingUser) {
      const fallbackEmail = customerEmail
        ? String(customerEmail).trim().toLowerCase()
        : `cliente_${Date.now()}@supplymax.local`;
      existingUser = await prisma.user.upsert({
        where: { email: fallbackEmail },
        update: {},
        create: {
          name: customerName ? String(customerName).trim() : 'Cliente SupplyMax',
          email: fallbackEmail,
          password: 'guest_checkout_account',
          role_id: 'User',
          phone: customerPhone ? String(customerPhone).trim() : null,
          idNumber: customerIdNumber ? String(customerIdNumber).trim() : null,
        },
      });
    }
    resolvedUserId = existingUser.id;

    // 2. Execute Order Creation, Stock Decrement, and Commission Logic in a Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Ensure all referenced products exist in DB (handles fallback catalog IDs 101..204)
      const resolvedItems: Array<{ productId: number; quantity: number; price: number }> = [];

      for (const item of items) {
        const rawId = Number(item.id ?? item.productId);
        const qty = Math.max(1, Number(item.quantity) || 1);
        const itemPrice = Number(item.price) || 0;

        let prod = !Number.isNaN(rawId) && rawId > 0
          ? await tx.product.findUnique({ where: { id: rawId } })
          : null;

        if (!prod && item.name) {
          prod = await tx.product.findFirst({ where: { name: String(item.name) } });
        }

        if (!prod) {
          prod = await tx.product.create({
            data: {
              name: String(item.name || 'Producto SupplyMax'),
              category: String(item.category || 'Suplementos'),
              goal: String(item.goal || ''),
              price: itemPrice,
              image: String(item.image || '/protein.png'),
              description: String(item.description || item.name || 'Producto SupplyMax'),
              stock: Math.max(0, 10 - qty),
            },
          });
        } else {
          // Decrement product stock safely
          await tx.product.update({
            where: { id: prod.id },
            data: { stock: Math.max(0, (prod.stock || 0) - qty) },
          });
        }

        resolvedItems.push({
          productId: prod.id,
          quantity: qty,
          price: itemPrice,
        });
      }

      // Update user's phone/idNumber if provided at checkout
      if (customerPhone || customerIdNumber) {
        try {
          await tx.user.update({
            where: { id: resolvedUserId },
            data: {
              ...(customerPhone ? { phone: String(customerPhone).trim() } : {}),
              ...(customerIdNumber ? { idNumber: String(customerIdNumber).trim() } : {}),
            },
          });
        } catch {
          // Ignore non-critical user update error
        }
      }

      const numTotal = Number(total) || 0;
      const numTotalVes = totalVes !== undefined && totalVes !== null ? Number(totalVes) : null;
      const numBcvRate = bcvRate !== undefined && bcvRate !== null ? Number(bcvRate) : null;

      // Create the Order and include items + product details
      const newOrder = await tx.order.create({
        data: {
          userId: resolvedUserId,
          total: Number.isFinite(numTotal) ? numTotal : 0,
          totalVes: numTotalVes !== null && Number.isFinite(numTotalVes) ? numTotalVes : null,
          bcvRate: numBcvRate !== null && Number.isFinite(numBcvRate) ? numBcvRate : null,
          customerName: customerName ? String(customerName).trim() : null,
          customerIdNumber: customerIdNumber ? String(customerIdNumber).trim() : null,
          customerPhone: customerPhone ? String(customerPhone).trim() : null,
          customerEmail: customerEmail ? String(customerEmail).trim() : null,
          status: 'PENDIENTE',
          referralCode: referralCode ? String(referralCode).trim() : null,
          agency: agency ? String(agency).trim() : null,
          paymentRef: paymentRef ? String(paymentRef).trim() : null,
          items: {
            create: resolvedItems,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Handle Influencer Commission if referralCode exists
      if (referralCode) {
        const influencer = await tx.user.findUnique({
          where: { affiliate_code: String(referralCode).trim() },
        });

        if (influencer && influencer.role_id === 'Influencer') {
          const settings = await tx.setting.findMany();
          const config = settings.reduce((acc: Record<string, string>, curr) => {
            acc[curr.key] = curr.value;
            return acc;
          }, {});

          let rate = 0.05;
          if (influencer.sub_level === 'Platino') rate = (parseFloat(config.inf_plat_comm) || 10) / 100;
          else if (influencer.sub_level === 'Oro') rate = (parseFloat(config.inf_gold_comm) || 7) / 100;
          else rate = (parseFloat(config.inf_base_comm) || 5) / 100;

          const commission = (Number.isFinite(numTotal) ? numTotal : 0) * rate;

          await tx.user.update({
            where: { id: influencer.id },
            data: {
              tokens: {
                increment: commission,
              },
            },
          });
        }
      }

      return newOrder;
    });

    return NextResponse.json(sanitizeJsonPayload(result));
  } catch (error: any) {
    console.error('[Order Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al procesar el pedido' },
      { status: 500 }
    );
  }
}
