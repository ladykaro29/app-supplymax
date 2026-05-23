import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Fetch staff members (Influencer/Athlete, Coach, Delivery)
    const staffUsers = await prisma.user.findMany({
      where: {
        role_id: { in: ['Influencer', 'Coach', 'Delivery'] }
      },
      orderBy: { name: 'asc' }
    });

    // 2. Fetch all orders with their items, product details, and the ordering user
    const allOrders = await prisma.order.findMany({
      include: {
        user: { select: { name: true } },
        items: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // 3. Process and aggregate data for each staff member
    const processedStaff = staffUsers.map(member => {
      // Find orders linked to this member
      let referredOrders: any[] = [];
      if (member.role_id === 'Influencer') {
        referredOrders = allOrders.filter(o => 
          o.referralCode && member.affiliate_code && 
          o.referralCode.trim().toLowerCase() === member.affiliate_code.trim().toLowerCase()
        );
      } else if (member.role_id === 'Coach') {
        referredOrders = allOrders.filter(o => 
          (o.referralCode && member.affiliate_code && 
           o.referralCode.trim().toLowerCase() === member.affiliate_code.trim().toLowerCase()) ||
          o.userId === member.id
        );
      }

      // Calculate gross sales in USD
      const totalSalesUSD = referredOrders.reduce((sum, o) => sum + o.total, 0);
      
      // Determine commission rate based on manual level:
      // Nivel 1 (Oro): 10%, Nivel 2: 8%, Nivel 3: 5% (default)
      let commissionRate = 0.05; 
      const lvl = member.level || 'Nivel 3';
      
      if (lvl.includes('Nivel 1') || lvl.includes('Oro')) {
        commissionRate = 0.10;
      } else if (lvl.includes('Nivel 2')) {
        commissionRate = 0.08;
      } else if (lvl.includes('Nivel 3')) {
        commissionRate = 0.05;
      }
      
      const accumulatedCommissions = totalSalesUSD * commissionRate;

      // Calculate net brand profit (gross profit margin of sold products minus paid commissions)
      let totalBrandNetProfit = 0;
      referredOrders.forEach(o => {
        let orderProfit = 0;
        o.items.forEach((item: any) => {
          const purchase = item.product.purchasePrice || (item.product.price * 0.6);
          const profit = item.price - purchase;
          orderProfit += profit * item.quantity;
        });
        totalBrandNetProfit += orderProfit;
      });
      
      const brandNetProfit = Math.max(0, totalBrandNetProfit - accumulatedCommissions);

      // Desegregated sales history
      const salesHistory = referredOrders.map(o => {
        const productsBought = o.items.map((item: any) => {
          const qtyStr = item.quantity > 1 ? `${item.quantity}x ` : '';
          return `${qtyStr}${item.product.name}`;
        }).join(', ');

        return {
          id: o.id,
          clientName: o.user.name,
          productsBought,
          total: o.total,
          date: o.createdAt,
          isSelfPurchase: o.userId === member.id
        };
      });

      return {
        id: member.id,
        name: member.name,
        email: member.email,
        role_id: member.role_id,
        level: member.level || 'Nivel 3',
        affiliate_code: member.affiliate_code || '',
        avatar: member.image || '',
        totalSalesUSD,
        accumulatedCommissions,
        brandNetProfit,
        salesHistory
      };
    });

    return NextResponse.json(processedStaff);
  } catch (error: any) {
    console.error('[API STAFF GET ERROR]:', error);
    return NextResponse.json(
      { error: `Error al obtener staff: ${error.message || 'Desconocido'}` },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId, level } = await request.json();
    if (!userId || !level) {
      return NextResponse.json({ error: 'Falta el campo userId o level en la solicitud.' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { level }
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error('[API STAFF PATCH ERROR]:', error);
    return NextResponse.json(
      { error: `Error al actualizar el nivel del staff: ${error.message || 'Desconocido'}` },
      { status: 500 }
    );
  }
}
