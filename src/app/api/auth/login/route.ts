import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Hardcoded admin fallback — guarantees admin access even if the
// production database is empty, uses a different file, or the seed
// didn't run. TODO: remove once DB issues are fully resolved.
const ADMIN_FALLBACK = {
  id: 'admin-fallback-001',
  name: 'Admin Supplymax',
  email: 'admin@supplymax.app',
  password: '123Suppli',
  role_id: 'Admin',
  level: 'Bronce',
  sub_level: null,
  status: 'Active',
  tokens: 0,
  affiliate_code: null,
  coach_tier: null,
  is_featured: false,
  image: null,
  addresses: [],
};

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    console.log(`[LOGIN ATTEMPT] Email: ${normalizedEmail}`);
    console.log(`[LOGIN DEBUG] DATABASE_URL: ${process.env.DATABASE_URL}`);

    // Try database lookup first
    let user = null;
    try {
      const userCount = await prisma.user.count();
      console.log(`[LOGIN DEBUG] Total users in DB: ${userCount}`);

      user = await prisma.user.findFirst({
        where: { 
          email: {
            equals: normalizedEmail
          }
        },
        include: {
          addresses: true,
        },
      });
    } catch (dbError: any) {
      console.error(`[LOGIN DB ERROR] ${dbError.message}`);
    }

    // Fallback: if DB lookup failed or user not found, check hardcoded admin
    if (!user) {
      if (normalizedEmail === ADMIN_FALLBACK.email && password === ADMIN_FALLBACK.password) {
        console.log(`[LOGIN FALLBACK] Admin authenticated via hardcoded fallback`);
        const { password: _, ...adminWithoutPassword } = ADMIN_FALLBACK;
        return NextResponse.json(adminWithoutPassword);
      }

      console.log(`[LOGIN FAILED] User not found for email: ${normalizedEmail}`);
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // WARNING: In production use bcrypt.compare()
    if (user.password !== password) {
      console.log(`[LOGIN FAILED] Incorrect password for email: ${normalizedEmail}`);
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    console.log(`[LOGIN SUCCESS] User logged in: ${normalizedEmail}`);
    return NextResponse.json(userWithoutPassword);
  } catch (error: any) {
    console.error('[LOGIN ERROR]:', error);
    return NextResponse.json({ error: `Error en el servidor: ${error.message || 'Error desconocido'}` }, { status: 500 });
  }
}
