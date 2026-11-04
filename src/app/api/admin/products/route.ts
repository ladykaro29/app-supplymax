import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { slugify } from '@/lib/slugify';

export const dynamic = 'force-dynamic';

const INITIAL_PRODUCTS = [
  {
    name: "Pure Whey Impact 5lb",
    category: "Proteínas",
    goal: "MÁS VENDIDO",
    price: 65.00,
    purchasePrice: 42.00,
    image: "/brand-photos/Suplementos/IMG-20260513-WA0013.jpg",
    description: "Proteína de suero de alta calidad para máxima recuperación muscular.",
    isFeatured: true,
    portions: "70",
    flavor: "Vainilla, Chocolate, Fresa",
    weight: "2.2kg, 5 lbs",
    durationInDays: "30",
    stock: 18,
    purchaseType: "CONTADO",
  },
  {
    name: "Creatine Micronized 300g",
    category: "Creatinas",
    goal: "FUERZA MÁXIMA",
    price: 35.00,
    purchasePrice: 20.00,
    image: "/brand-photos/Suplementos/IMG-20260513-WA0017.jpg",
    description: "Creatina monohidratada pura para aumento de fuerza y potencia celular.",
    isOffer: true,
    discount: 5,
    weight: "300g, 500g",
    durationInDays: "60",
    stock: 25,
    purchaseType: "CONTADO",
  },
  {
    name: "Creatina Creapure Elite 500g",
    category: "Creatinas",
    goal: "PREMIUM",
    price: 49.99,
    purchasePrice: 28.00,
    image: "/brand-photos/Suplementos/IMG-20260513-WA0018.jpg",
    description: "Creatina Creapure alemana patentada de máxima solubilidad y pureza científica.",
    weight: "500g, 1 kg",
    durationInDays: "100",
    stock: 12,
    purchaseType: "CREDITO",
    supplierName: "Distribuidor Oficial Creapure",
    creditDueDate: "2026-10-15",
    creditDebt: 336.00,
    creditPaid: false,
  },
  {
    name: "Creatina HCL Concentrated 150g",
    category: "Creatinas",
    goal: "POTENCIA CELULAR",
    price: 39.99,
    purchasePrice: 22.00,
    image: "/brand-photos/Suplementos/IMG-20260513-WA0019.jpg",
    description: "Creatina clorhidrato concentrada de rápida absorción sin retención de líquido extracelular.",
    weight: "150g, 300g",
    durationInDays: "50",
    stock: 10,
    purchaseType: "CONTADO",
  },
  {
    name: "Creatine Plus Energy 300g",
    category: "Creatinas",
    goal: "ENERGÍA EXTRA",
    price: 37.99,
    purchasePrice: 21.00,
    image: "/brand-photos/Suplementos/IMG-20260513-WA0016.jpg",
    description: "Creatina monohidratada adicionada con taurina y electrolitos para una contracción muscular potente.",
    weight: "300g",
    durationInDays: "60",
    stock: 15,
    purchaseType: "CONTADO",
  },
  {
    name: "Elite Amino Recovery",
    category: "Aminoácidos/BCAA",
    goal: "RECUPERACIÓN",
    price: 29.99,
    purchasePrice: 15.00,
    image: "/brand-photos/Suplementos/IMG-20260513-WA0020.jpg",
    description: "BCAA premium para evitar el catabolismo y promover la hidratación muscular.",
    flavor: "Blue Raspberry, Fruit Punch",
    weight: "400g, 30 Servicios",
    durationInDays: "45",
    stock: 20,
    purchaseType: "CONTADO",
  },
  {
    name: "Pre-Workout Nitro",
    category: "Pre-Entrenos",
    goal: "ENERGÍA",
    price: 45.00,
    purchasePrice: 24.00,
    image: "/brand-photos/Suplementos/IMG-20260513-WA0024.jpg",
    description: "Explosión de energía para tus entrenamientos más pesados y enfoque mental extremo.",
    portions: "30",
    flavor: "Fruit Punch, Manzana Verde",
    durationInDays: "30",
    stock: 14,
    purchaseType: "CONTADO",
  },
  {
    name: "Camiseta Oversized Blanca SupplyMax",
    category: "Ropa",
    goal: "COLECCIÓN BLANCA",
    price: 25.00,
    purchasePrice: 11.00,
    image: "/brand-photos/Ropa con modelo/IMG_7283.png",
    description: "Camiseta oversized blanca de algodón premium pesado, corte lifestyle ultra estético.",
    isFeatured: true,
    sizes: "S,M,L,XL",
    stock: 22,
    purchaseType: "CONTADO",
  },
  {
    name: "Camiseta Oversized Negra SupplyMax",
    category: "Ropa",
    goal: "COLECCIÓN NEGRA",
    price: 25.00,
    purchasePrice: 11.00,
    image: "/brand-photos/Ropa con modelo/IMG_7282.png",
    description: "Camiseta oversized negra de algodón pesado con logo de la marca, horma perfecta.",
    isFeatured: true,
    sizes: "S,M,L,XL",
    stock: 30,
    purchaseType: "CONTADO",
  },
  {
    name: "Performance Joggers Negros",
    category: "Ropa",
    goal: "COLECCIÓN NEGRA",
    price: 45.00,
    purchasePrice: 20.00,
    image: "/brand-photos/Ropa con modelo/IMG_7287.png",
    description: "Pantalones deportivos ajustados de color negro con tecnología dry-fit y bolsillos con cierre.",
    isFeatured: true,
    sizes: "M,L,XL",
    stock: 16,
    purchaseType: "CONTADO",
  },
  {
    name: "Bolso Deportivo SupplyMax Premium",
    category: "Ropa",
    goal: "ACCESORIO",
    price: 45.00,
    purchasePrice: 22.00,
    image: "/brand-products/supplymax-bag.jpg",
    description: "Bolso deportivo tipo saco, liviano, práctico y resistente para llevar tus suplementos, shaker y ropa de entrenamiento al gimnasio.",
    sizes: "Único",
    stock: 8,
    purchaseType: "CONTADO",
  }
];

function toSafeFloat(val: any, fallback: number | null = null): number | null {
  if (val === undefined || val === null || val === '') return fallback;
  const str = typeof val === 'string' ? val.replace(/,/g, '.').trim() : String(val);
  if (!str) return fallback;
  const num = Number(str);
  return Number.isFinite(num) ? num : fallback;
}

function toSafeInt(val: any, fallback: number = 10): number {
  if (val === undefined || val === null || val === '') return fallback;
  const num = parseInt(String(val).trim(), 10);
  return Number.isFinite(num) ? num : fallback;
}

function toSafeStr(val: any, fallback: string | null = null): string | null {
  if (val === undefined || val === null) return fallback;
  const trimmed = String(val).trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function sanitizeJsonPayload<T extends Record<string, any>>(obj: T): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    if (typeof v === 'number' && !Number.isFinite(v)) continue;
    if (typeof v === 'bigint') {
      clean[k] = Number(v);
      continue;
    }
    clean[k] = v;
  }
  return clean;
}

let schemaChecked = false;
async function ensureProductTableSchema() {
  if (schemaChecked) return;
  try {
    const columns: Array<{ name: string }> = await prisma.$queryRawUnsafe(`PRAGMA table_info("Product")`);
    const existing = new Set((columns || []).map(c => c.name));

    const alterStatements: Array<[string, string]> = [
      ['slug', `ALTER TABLE "Product" ADD COLUMN "slug" TEXT`],
      ['goal', `ALTER TABLE "Product" ADD COLUMN "goal" TEXT DEFAULT ''`],
      ['purchasePrice', `ALTER TABLE "Product" ADD COLUMN "purchasePrice" REAL`],
      ['images', `ALTER TABLE "Product" ADD COLUMN "images" TEXT`],
      ['portions', `ALTER TABLE "Product" ADD COLUMN "portions" TEXT`],
      ['flavor', `ALTER TABLE "Product" ADD COLUMN "flavor" TEXT`],
      ['weight', `ALTER TABLE "Product" ADD COLUMN "weight" TEXT`],
      ['sizes', `ALTER TABLE "Product" ADD COLUMN "sizes" TEXT`],
      ['durationInDays', `ALTER TABLE "Product" ADD COLUMN "durationInDays" TEXT`],
      ['isFeatured', `ALTER TABLE "Product" ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT 0`],
      ['isOffer', `ALTER TABLE "Product" ADD COLUMN "isOffer" BOOLEAN NOT NULL DEFAULT 0`],
      ['discount', `ALTER TABLE "Product" ADD COLUMN "discount" REAL`],
      ['stock', `ALTER TABLE "Product" ADD COLUMN "stock" INTEGER NOT NULL DEFAULT 10`],
      ['supplierName', `ALTER TABLE "Product" ADD COLUMN "supplierName" TEXT`],
      ['purchaseType', `ALTER TABLE "Product" ADD COLUMN "purchaseType" TEXT DEFAULT 'CONTADO'`],
      ['creditDueDate', `ALTER TABLE "Product" ADD COLUMN "creditDueDate" TEXT`],
      ['creditDebt', `ALTER TABLE "Product" ADD COLUMN "creditDebt" REAL`],
      ['creditPaid', `ALTER TABLE "Product" ADD COLUMN "creditPaid" BOOLEAN DEFAULT 0`],
    ];

    for (const [colName, sql] of alterStatements) {
      if (existing.size > 0 && !existing.has(colName)) {
        try {
          await prisma.$executeRawUnsafe(sql);
          console.log(`[DB AUTO-MIGRATE] Added missing column Product.${colName}`);
        } catch (alterErr) {
          console.warn(`[DB AUTO-MIGRATE] Notice adding ${colName}:`, alterErr);
        }
      }
    }
    schemaChecked = true;
  } catch (err) {
    console.warn('[DB AUTO-MIGRATE] Could not inspect Product table:', err);
  }
}

// GET: Fetch all products from SQLite (with auto-initialization fallback)
export async function GET() {
  try {
    await ensureProductTableSchema();

    let products = await prisma.product.findMany({
      orderBy: { id: 'asc' }
    });

    // Auto-seed if database has 0 products
    if (products.length === 0) {
      console.log('[API PRODUCTS] Database is empty, populating initial catalog...');
      for (const item of INITIAL_PRODUCTS) {
        try {
          await prisma.product.create({ data: sanitizeJsonPayload(item) as any });
        } catch (itemErr) {
          console.warn('[API PRODUCTS] Full item creation failed, falling back to core fields:', itemErr);
          try {
            await prisma.product.create({
              data: {
                name: item.name,
                category: item.category,
                goal: item.goal || '',
                price: item.price,
                image: item.image,
                description: item.description,
              }
            });
          } catch (basicErr) {
            console.error('[API PRODUCTS] Basic item creation failed:', basicErr);
          }
        }
      }
      products = await prisma.product.findMany({
        orderBy: { id: 'asc' }
      });
    }

    // Ensure all returned products have a valid SEO slug and are JSON-serializable
    const productsWithSlug = products.map(p => sanitizeJsonPayload({
      ...p,
      slug: (p as any).slug || slugify(p.name) || String(p.id)
    }));

    return NextResponse.json(productsWithSlug);
  } catch (error: any) {
    console.error('[API PRODUCTS GET ERROR]:', error);
    return NextResponse.json(
      { error: `Error al obtener productos: ${error.message || 'Desconocido'}` },
      { status: 500 }
    );
  }
}

// POST: Create (register) a new product
export async function POST(request: Request) {
  try {
    await ensureProductTableSchema();

    const body = await request.json();
    const {
      name,
      category,
      goal,
      price,
      purchasePrice,
      image,
      description,
      portions,
      flavor,
      weight,
      sizes,
      durationInDays,
      isFeatured,
      isOffer,
      discount,
      stock,
      supplierName,
      purchaseType,
      creditDueDate,
      creditDebt,
      creditPaid,
      slug,
    } = body;

    const cleanName = toSafeStr(name);
    const cleanCategory = toSafeStr(category);
    const cleanPrice = toSafeFloat(price);

    if (!cleanName || !cleanCategory || cleanPrice === null || cleanPrice <= 0) {
      return NextResponse.json(
        { error: 'El nombre, la categoría y un precio de venta válido (> 0) son requeridos.' },
        { status: 400 }
      );
    }

    // Compute unique SEO slug safely
    let candidateSlug: string | undefined = undefined;
    try {
      let rawSlug = slug ? slugify(String(slug)) : slugify(cleanName);
      if (!rawSlug) rawSlug = `producto-${Date.now()}`;
      candidateSlug = rawSlug;
      let counter = 1;
      while (await (prisma.product as any).findFirst({ where: { slug: candidateSlug } })) {
        counter++;
        candidateSlug = `${rawSlug}-${counter}`;
      }
    } catch {
      candidateSlug = undefined;
    }

    // Process sizes if it's an array
    let processedSizes: string | null = null;
    if (Array.isArray(sizes)) {
      const joined = sizes.map(s => String(s).trim()).filter(Boolean).join(',');
      processedSizes = joined.length > 0 ? joined : null;
    } else if (typeof sizes === 'string' && sizes.trim().length > 0) {
      processedSizes = sizes.trim();
    }

    // Process images array (up to 10 images)
    let processedImages: string | null = null;
    let primaryImage = toSafeStr(image, '/protein.png') || '/protein.png';
    if (Array.isArray(body.images) && body.images.length > 0) {
      const validImages = body.images
        .filter((img: any) => typeof img === 'string' && img.trim().length > 0)
        .map((img: string) => img.trim())
        .slice(0, 10);
      if (validImages.length > 0) {
        processedImages = JSON.stringify(validImages);
        primaryImage = validImages[0];
      }
    } else if (typeof body.images === 'string' && body.images.trim().length > 0) {
      processedImages = body.images.trim();
    }

    const createData: Record<string, any> = sanitizeJsonPayload({
      name: cleanName,
      ...(candidateSlug ? { slug: candidateSlug } : {}),
      category: cleanCategory,
      goal: toSafeStr(goal, '') ?? '',
      price: cleanPrice,
      image: primaryImage,
      description: toSafeStr(description, '') ?? '',
      isFeatured: Boolean(isFeatured),
      isOffer: Boolean(isOffer),
      discount: toSafeFloat(discount, null),
      stock: toSafeInt(stock, 10),
      portions: toSafeStr(portions, null),
      flavor: toSafeStr(flavor, null),
      weight: toSafeStr(weight, null),
      sizes: processedSizes,
      durationInDays: toSafeStr(durationInDays, null),
      purchasePrice: toSafeFloat(purchasePrice, null),
      images: processedImages || JSON.stringify([primaryImage]),
      supplierName: toSafeStr(supplierName, null),
      purchaseType: purchaseType === 'CREDITO' ? 'CREDITO' : 'CONTADO',
      creditDueDate: toSafeStr(creditDueDate, null),
      creditDebt: toSafeFloat(creditDebt, null),
      creditPaid: Boolean(creditPaid),
    });

    let newProduct: any = null;
    let lastError: any = null;

    // Strategy 1: Try full create, stripping any unknown Prisma arguments dynamically
    const workingData = { ...createData };
    for (let attempt = 0; attempt < 25; attempt++) {
      try {
        newProduct = await prisma.product.create({ data: sanitizeJsonPayload(workingData) as any });
        if (newProduct) break;
      } catch (err: any) {
        lastError = err;
        const msg = String(err?.message || '');
        const match = msg.match(/Unknown argument [`'"]?([a-zA-Z0-9_]+)[`'"]?/);
        if (match && match[1] && workingData[match[1]] !== undefined) {
          console.warn(`[API PRODUCTS POST] Stripping unsupported argument '${match[1]}' and retrying...`);
          delete workingData[match[1]];
          continue;
        }
        break;
      }
    }

    // Strategy 2: Progressive fallback tiers if Strategy 1 failed
    if (!newProduct) {
      const tiers: Array<Record<string, any>> = [
        {
          name: cleanName,
          category: cleanCategory,
          goal: toSafeStr(goal, '') ?? '',
          price: cleanPrice,
          image: primaryImage,
          description: toSafeStr(description, '') ?? '',
          isFeatured: Boolean(isFeatured),
          isOffer: Boolean(isOffer),
          discount: toSafeFloat(discount, null),
          stock: toSafeInt(stock, 10),
          portions: toSafeStr(portions, null),
          flavor: toSafeStr(flavor, null),
          weight: toSafeStr(weight, null),
          sizes: processedSizes,
          durationInDays: toSafeStr(durationInDays, null),
        },
        {
          name: cleanName,
          category: cleanCategory,
          goal: toSafeStr(goal, '') ?? '',
          price: cleanPrice,
          image: primaryImage,
          description: toSafeStr(description, '') ?? '',
        },
      ];

      for (const tierData of tiers) {
        try {
          newProduct = await prisma.product.create({ data: sanitizeJsonPayload(tierData) as any });
          if (newProduct) break;
        } catch (err) {
          lastError = err;
        }
      }
    }

    // Strategy 3: Direct SQLite raw INSERT fallback if Prisma client schema is out of sync with DB
    if (!newProduct) {
      try {
        await prisma.$executeRawUnsafe(
          `INSERT INTO "Product" ("name", "category", "goal", "price", "image", "description", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          cleanName,
          cleanCategory,
          toSafeStr(goal, '') ?? '',
          cleanPrice,
          primaryImage,
          toSafeStr(description, '') ?? ''
        );
        const rows: any[] = await prisma.$queryRawUnsafe(
          `SELECT * FROM "Product" ORDER BY "id" DESC LIMIT 1`
        );
        newProduct = (rows && rows[0]) ? rows[0] : { id: Date.now(), ...createData };
      } catch (rawErr) {
        lastError = rawErr;
      }
    }

    if (!newProduct) {
      throw lastError || new Error('No se pudo insertar el producto en la base de datos.');
    }

    const safeResponse = sanitizeJsonPayload({
      ...newProduct,
      name: newProduct.name || cleanName,
    });

    return NextResponse.json(safeResponse, { status: 201 });
  } catch (error: any) {
    console.error('[API PRODUCTS POST ERROR]:', error);
    return NextResponse.json(
      { error: `Error al crear el producto: ${error?.message || 'Desconocido'}` },
      { status: 500 }
    );
  }
}

// PUT: Update an existing product
export async function PUT(request: Request) {
  try {
    await ensureProductTableSchema();

    const body = await request.json();
    const {
      id,
      name,
      category,
      goal,
      price,
      purchasePrice,
      image,
      description,
      portions,
      flavor,
      weight,
      sizes,
      durationInDays,
      isFeatured,
      isOffer,
      discount,
      stock,
      supplierName,
      purchaseType,
      creditDueDate,
      creditDebt,
      creditPaid,
      slug,
    } = body;

    const productId = toSafeInt(id, 0);
    if (!productId) {
      return NextResponse.json(
        { error: 'El ID del producto es requerido para realizar la actualización.' },
        { status: 400 }
      );
    }

    const cleanName = toSafeStr(name);
    const cleanCategory = toSafeStr(category);
    const cleanPrice = toSafeFloat(price);

    if (!cleanName || !cleanCategory || cleanPrice === null || cleanPrice <= 0) {
      return NextResponse.json(
        { error: 'El nombre, la categoría y un precio de venta válido (> 0) son requeridos.' },
        { status: 400 }
      );
    }

    // Compute unique SEO slug if changed or provided
    let candidateSlug: string | undefined = undefined;
    if (slug || cleanName) {
      const rawSlug = slug ? slugify(String(slug)) : slugify(cleanName);
      if (rawSlug) {
        try {
          candidateSlug = rawSlug;
          let counter = 1;
          while (await (prisma.product as any).findFirst({ where: { slug: candidateSlug, NOT: { id: productId } } })) {
            counter++;
            candidateSlug = `${rawSlug}-${counter}`;
          }
        } catch {
          candidateSlug = undefined;
        }
      }
    }

    // Process sizes if it's an array
    let processedSizes: string | null = null;
    if (Array.isArray(sizes)) {
      const joined = sizes.map(s => String(s).trim()).filter(Boolean).join(',');
      processedSizes = joined.length > 0 ? joined : null;
    } else if (typeof sizes === 'string' && sizes.trim().length > 0) {
      processedSizes = sizes.trim();
    }

    // Process images array (up to 10 images)
    let processedImages: string | null = null;
    let primaryImage = toSafeStr(image, '/protein.png') || '/protein.png';
    if (Array.isArray(body.images) && body.images.length > 0) {
      const validImages = body.images
        .filter((img: any) => typeof img === 'string' && img.trim().length > 0)
        .map((img: string) => img.trim())
        .slice(0, 10);
      if (validImages.length > 0) {
        processedImages = JSON.stringify(validImages);
        primaryImage = validImages[0];
      }
    } else if (typeof body.images === 'string' && body.images.trim().length > 0) {
      processedImages = body.images.trim();
    }

    const updateData: Record<string, any> = sanitizeJsonPayload({
      name: cleanName,
      ...(candidateSlug ? { slug: candidateSlug } : {}),
      category: cleanCategory,
      goal: toSafeStr(goal, '') ?? '',
      price: cleanPrice,
      image: primaryImage,
      description: toSafeStr(description, '') ?? '',
      isFeatured: Boolean(isFeatured),
      isOffer: Boolean(isOffer),
      discount: toSafeFloat(discount, null),
      stock: toSafeInt(stock, 10),
      portions: toSafeStr(portions, null),
      flavor: toSafeStr(flavor, null),
      weight: toSafeStr(weight, null),
      sizes: processedSizes,
      durationInDays: toSafeStr(durationInDays, null),
      purchasePrice: toSafeFloat(purchasePrice, null),
      images: processedImages || JSON.stringify([primaryImage]),
      supplierName: toSafeStr(supplierName, null),
      purchaseType: purchaseType === 'CREDITO' ? 'CREDITO' : 'CONTADO',
      creditDueDate: toSafeStr(creditDueDate, null),
      creditDebt: toSafeFloat(creditDebt, null),
      creditPaid: Boolean(creditPaid),
    });

    let updatedProduct: any = null;
    let lastError: any = null;

    const workingData = { ...updateData };
    for (let attempt = 0; attempt < 25; attempt++) {
      try {
        updatedProduct = await prisma.product.update({
          where: { id: productId },
          data: sanitizeJsonPayload(workingData) as any,
        });
        if (updatedProduct) break;
      } catch (err: any) {
        lastError = err;
        const msg = String(err?.message || '');
        const match = msg.match(/Unknown argument [`'"]?([a-zA-Z0-9_]+)[`'"]?/);
        if (match && match[1] && workingData[match[1]] !== undefined) {
          console.warn(`[API PRODUCTS PUT] Stripping unsupported argument '${match[1]}' and retrying...`);
          delete workingData[match[1]];
          continue;
        }
        break;
      }
    }

    if (!updatedProduct) {
      const tiers: Array<Record<string, any>> = [
        {
          name: cleanName,
          category: cleanCategory,
          goal: toSafeStr(goal, '') ?? '',
          price: cleanPrice,
          image: primaryImage,
          description: toSafeStr(description, '') ?? '',
          isFeatured: Boolean(isFeatured),
          isOffer: Boolean(isOffer),
          discount: toSafeFloat(discount, null),
          stock: toSafeInt(stock, 10),
          portions: toSafeStr(portions, null),
          flavor: toSafeStr(flavor, null),
          weight: toSafeStr(weight, null),
          sizes: processedSizes,
          durationInDays: toSafeStr(durationInDays, null),
        },
        {
          name: cleanName,
          category: cleanCategory,
          goal: toSafeStr(goal, '') ?? '',
          price: cleanPrice,
          image: primaryImage,
          description: toSafeStr(description, '') ?? '',
        },
      ];

      for (const tierData of tiers) {
        try {
          updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: sanitizeJsonPayload(tierData) as any,
          });
          if (updatedProduct) break;
        } catch (err) {
          lastError = err;
        }
      }
    }

    // Strategy 3: Direct SQLite raw UPDATE fallback
    if (!updatedProduct) {
      try {
        await prisma.$executeRawUnsafe(
          `UPDATE "Product" SET "name" = ?, "category" = ?, "goal" = ?, "price" = ?, "image" = ?, "description" = ?, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = ?`,
          cleanName,
          cleanCategory,
          toSafeStr(goal, '') ?? '',
          cleanPrice,
          primaryImage,
          toSafeStr(description, '') ?? '',
          productId
        );
        const rows: any[] = await prisma.$queryRawUnsafe(
          `SELECT * FROM "Product" WHERE "id" = ? LIMIT 1`,
          productId
        );
        updatedProduct = (rows && rows[0]) ? rows[0] : { id: productId, ...updateData };
      } catch (rawErr) {
        lastError = rawErr;
      }
    }

    if (!updatedProduct) {
      throw lastError || new Error('No se pudo actualizar el producto en la base de datos.');
    }

    const safeResponse = sanitizeJsonPayload({
      ...updatedProduct,
      name: updatedProduct.name || cleanName,
    });

    return NextResponse.json(safeResponse);
  } catch (error: any) {
    console.error('[API PRODUCTS PUT ERROR]:', error);
    return NextResponse.json(
      { error: `Error al actualizar el producto: ${error?.message || 'Desconocido'}` },
      { status: 500 }
    );
  }
}

// DELETE: Safely remove a product if it has no associated orders
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get('id');

    if (!idParam) {
      return NextResponse.json(
        { error: 'El ID del producto es requerido para eliminarlo.' },
        { status: 400 }
      );
    }

    const productId = parseInt(idParam, 10);

    // Business Logic Safety Check: Check if this product is part of any orders
    const relatedOrderItemsCount = await prisma.orderItem.count({
      where: { productId }
    });

    if (relatedOrderItemsCount > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar el producto porque está asociado a pedidos de clientes existentes. Considere desactivarlo o quitarlo de las ofertas/destacados.' },
        { status: 400 }
      );
    }

    // Safely delete if no references
    const deletedProduct = await prisma.product.delete({
      where: { id: productId }
    });

    return NextResponse.json(sanitizeJsonPayload({
      success: true,
      message: `Producto "${deletedProduct.name}" eliminado correctamente.`,
      product: sanitizeJsonPayload(deletedProduct as any),
    }));
  } catch (error: any) {
    console.error('[API PRODUCTS DELETE ERROR]:', error);
    return NextResponse.json(
      { error: `Error al eliminar el producto: ${error.message || 'Desconocido'}` },
      { status: 500 }
    );
  }
}
