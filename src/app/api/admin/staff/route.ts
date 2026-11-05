import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ensureDatabaseSchema, sanitizeJsonPayload } from '@/lib/dbInit';

export const dynamic = 'force-dynamic';

// Helper to determine commission rate based on level string
function getCommissionRate(level?: string | null): number {
  if (!level) return 0.05; // Default Nivel 3 (5%)
  const l = level.toLowerCase();
  if (l.includes('oro') || l.includes('1') || l.includes('platino')) return 0.10; // 10%
  if (l.includes('plata') || l.includes('2')) return 0.08; // 8%
  return 0.05; // Bronce / Nivel 3 (5%)
}

export async function GET() {
  try {
    await ensureDatabaseSchema();

    // 1. Fetch all staff members (Influencer, Coach, Delivery)
    const staffUsers = await prisma.user.findMany({
      where: {
        role_id: {
          in: ['Influencer', 'Coach', 'Delivery'],
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 2. Fetch all valid orders with items and products to calculate sales & COGS
    const allOrders = await prisma.order.findMany({
      where: {
        status: {
          not: 'CANCELADO',
        },
      },
      include: {
        user: { select: { name: true, email: true } },
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 3. Map each staff user with their dynamic financial performance
    const staffData = staffUsers.map((member) => {
      // Find orders linked to this member by referralCode OR if they are a Coach making self-purchases
      const relatedOrders = allOrders.filter((o) => {
        const matchesCode =
          member.affiliate_code &&
          o.referralCode &&
          o.referralCode.toLowerCase() === member.affiliate_code.toLowerCase();

        const isSelfCoachOrder = member.role_id === 'Coach' && o.userId === member.id;
        return matchesCode || isSelfCoachOrder;
      });

      const commRate = getCommissionRate(member.level);

      let totalSalesUSD = 0;
      let totalCogsUSD = 0;

      const salesHistory = relatedOrders.map((o) => {
        totalSalesUSD += o.total || 0;

        // Calculate COGS for this order (null-safe if a product was deleted)
        let orderCogs = 0;
        const productsList: string[] = [];

        (o.items || []).forEach((item) => {
          const prodName = item.product?.name || 'Producto';
          const rawPurchasePrice = item.product?.purchasePrice;
          // If purchasePrice is null, fallback to 65% of retail price as estimated cost
          const unitCost =
            rawPurchasePrice !== null && rawPurchasePrice !== undefined
              ? rawPurchasePrice
              : (item.price || 0) * 0.65;
          orderCogs += unitCost * (item.quantity || 1);
          productsList.push(`${item.quantity || 1}x ${prodName}`);
        });

        totalCogsUSD += orderCogs;

        return {
          id: o.id,
          clientName: o.customerName || o.user?.name || 'Cliente SupplyMax',
          productsBought: productsList.join(', ') || 'Compra general',
          total: o.total || 0,
          date: o.createdAt,
          isSelfPurchase: o.userId === member.id,
        };
      });

      const accumulatedCommissions = totalSalesUSD * commRate;
      const brandNetProfit = Math.max(0, totalSalesUSD - totalCogsUSD - accumulatedCommissions);

      return {
        id: member.id,
        name: member.name,
        email: member.email,
        role_id: member.role_id,
        level: member.level || 'Nivel 3',
        sub_level: member.sub_level || 'Estándar',
        status: member.status,
        affiliate_code: member.affiliate_code || 'SIN-CODIGO',
        avatar: member.image || '',
        totalSalesUSD,
        accumulatedCommissions,
        brandNetProfit,
        salesHistory,
      };
    });

    return NextResponse.json(sanitizeJsonPayload(staffData));
  } catch (error) {
    console.error('[API Admin Staff GET Error]:', error);
    return NextResponse.json({ error: 'Error al cargar personal y finanzas' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await ensureDatabaseSchema();

    const body = await request.json();
    const { userId, level, role_id, affiliate_code, status } = body;

    if (!userId) {
      return NextResponse.json({ error: 'ID de usuario requerido' }, { status: 400 });
    }

    const updateData: Record<string, any> = {};
    if (level !== undefined) updateData.level = level;
    if (role_id !== undefined) updateData.role_id = role_id;
    if (affiliate_code !== undefined) updateData.affiliate_code = affiliate_code;
    if (status !== undefined) updateData.status = status;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    const { password: _, ...safeUser } = updatedUser;
    return NextResponse.json(sanitizeJsonPayload(safeUser));
  } catch (error) {
    console.error('[API Admin Staff PATCH Error]:', error);
    return NextResponse.json({ error: 'Error al actualizar miembro del equipo' }, { status: 500 });
  }
}
