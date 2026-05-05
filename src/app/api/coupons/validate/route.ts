import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Código requerido' }, { status: 400 });
    }

    // First check if it's a Coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code, isActive: true }
    });

    if (coupon) {
      // Check expiry
      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        return NextResponse.json({ error: 'Cupón expirado' }, { status: 400 });
      }
      return NextResponse.json({ 
        valid: true, 
        type: 'COUPON',
        discount: coupon.discount,
        discountType: coupon.type 
      });
    }

    // Then check if it's an Affiliate Code
    const affiliate = await prisma.user.findUnique({
      where: { affiliate_code: code }
    });

    if (affiliate) {
      return NextResponse.json({ 
        valid: true, 
        type: 'AFFILIATE',
        discount: 0.05, // Standard 5%
        discountType: 'PERCENT'
      });
    }

    return NextResponse.json({ error: 'Código no válido' }, { status: 404 });

  } catch (error) {
    return NextResponse.json({ error: 'Error al validar código' }, { status: 500 });
  }
}
