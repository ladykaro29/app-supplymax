import prisma from '@/lib/prisma';

let schemaChecked = false;

/**
 * Ensures all SQLite tables have the latest columns defined in schema.prisma.
 * Prevents "Unknown argument" or "table has no column named ..." errors in production
 * (e.g. Easypanel persistent volumes where migrations might not have run).
 */
export async function ensureDatabaseSchema() {
  if (schemaChecked) return;
  try {
    // 1. Check User table columns
    const userCols = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
      `PRAGMA table_info("User");`
    );
    if (Array.isArray(userCols) && userCols.length > 0) {
      const existing = new Set(userCols.map((c) => c.name));
      const requiredUserCols: Array<[string, string]> = [
        ['role_id', 'TEXT NOT NULL DEFAULT "User"'],
        ['level', 'TEXT DEFAULT "Bronce"'],
        ['sub_level', 'TEXT'],
        ['status', 'TEXT NOT NULL DEFAULT "Active"'],
        ['tokens', 'REAL NOT NULL DEFAULT 0'],
        ['affiliate_code', 'TEXT'],
        ['coach_tier', 'INTEGER'],
        ['is_featured', 'BOOLEAN DEFAULT 0'],
        ['image', 'TEXT'],
        ['phone', 'TEXT'],
        ['idNumber', 'TEXT'],
        ['newsletter', 'BOOLEAN NOT NULL DEFAULT 1'],
      ];
      for (const [col, def] of requiredUserCols) {
        if (!existing.has(col)) {
          try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "${col}" ${def};`);
          } catch (e) {
            console.warn(`[DB-INIT] Could not add User.${col}:`, e);
          }
        }
      }
    }

    // 2. Check Product table columns
    const prodCols = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
      `PRAGMA table_info("Product");`
    );
    if (Array.isArray(prodCols) && prodCols.length > 0) {
      const existing = new Set(prodCols.map((c) => c.name));
      const requiredProdCols: Array<[string, string]> = [
        ['slug', 'TEXT'],
        ['goal', 'TEXT DEFAULT ""'],
        ['purchasePrice', 'REAL'],
        ['images', 'TEXT'],
        ['portions', 'TEXT'],
        ['flavor', 'TEXT'],
        ['weight', 'TEXT'],
        ['sizes', 'TEXT'],
        ['durationInDays', 'TEXT'],
        ['isFeatured', 'BOOLEAN NOT NULL DEFAULT 0'],
        ['isOffer', 'BOOLEAN NOT NULL DEFAULT 0'],
        ['discount', 'REAL'],
        ['stock', 'INTEGER NOT NULL DEFAULT 10'],
        ['supplierName', 'TEXT'],
        ['purchaseType', 'TEXT DEFAULT "CONTADO"'],
        ['creditDueDate', 'TEXT'],
        ['creditDebt', 'REAL'],
        ['creditPaid', 'BOOLEAN DEFAULT 0'],
      ];
      for (const [col, def] of requiredProdCols) {
        if (!existing.has(col)) {
          try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "Product" ADD COLUMN "${col}" ${def};`);
          } catch (e) {
            console.warn(`[DB-INIT] Could not add Product.${col}:`, e);
          }
        }
      }
    }

    // 3. Check Order table columns
    const orderCols = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
      `PRAGMA table_info("Order");`
    );
    if (Array.isArray(orderCols) && orderCols.length > 0) {
      const existing = new Set(orderCols.map((c) => c.name));
      const requiredOrderCols: Array<[string, string]> = [
        ['totalVes', 'REAL'],
        ['bcvRate', 'REAL'],
        ['customerName', 'TEXT'],
        ['customerIdNumber', 'TEXT'],
        ['customerPhone', 'TEXT'],
        ['customerEmail', 'TEXT'],
        ['status', 'TEXT NOT NULL DEFAULT "PENDIENTE"'],
        ['referralCode', 'TEXT'],
        ['agency', 'TEXT'],
        ['paymentRef', 'TEXT'],
      ];
      for (const [col, def] of requiredOrderCols) {
        if (!existing.has(col)) {
          try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "Order" ADD COLUMN "${col}" ${def};`);
          } catch (e) {
            console.warn(`[DB-INIT] Could not add Order.${col}:`, e);
          }
        }
      }
    }

    schemaChecked = true;
  } catch (err) {
    console.warn('[DB-INIT] Schema inspection warning:', err);
  }
}

/**
 * Sanitizes any object before passing to NextResponse.json() so BigInt, Date, NaN,
 * or undefined values never throw "TypeError: Value is not JSON serializable" in Node 20+.
 */
export function sanitizeJsonPayload<T = any>(obj: T): T {
  if (obj === undefined || obj === null) {
    return {} as T;
  }
  return JSON.parse(
    JSON.stringify(obj, (_key, value) => {
      if (typeof value === 'bigint') return Number(value);
      if (typeof value === 'number' && !Number.isFinite(value)) return 0;
      return value;
    })
  );
}

