import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
    description: "Bolso impermeable de alta capacidad para gimnasio con compartimento para calzado húmedo, espacio para suplementos y costuras reforzadas ultra resistentes.",
    sizes: "Único",
    stock: 8,
    purchaseType: "CONTADO",
  }
];

// GET: Fetch all products from SQLite (with auto-initialization fallback)
export async function GET() {
  try {
    let products = await prisma.product.findMany({
      orderBy: { id: 'asc' }
    });

    // Auto-seed if database has 0 products
    if (products.length === 0) {
      console.log('[API PRODUCTS] Database is empty, populating initial catalog...');
      for (const item of INITIAL_PRODUCTS) {
        try {
          await prisma.product.create({ data: item as any });
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

    return NextResponse.json(products);
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
    } = body;

    if (!name || !category || price === undefined || price === null) {
      return NextResponse.json(
        { error: 'El nombre, la categoría y el precio de venta son requeridos.' },
        { status: 400 }
      );
    }

    // Process sizes if it's an array
    let processedSizes = '';
    if (Array.isArray(sizes)) {
      processedSizes = sizes.join(',');
    } else if (typeof sizes === 'string') {
      processedSizes = sizes;
    }

    // Process images array (up to 10 images)
    let processedImages = '';
    let primaryImage = image ? String(image).trim() : '/protein.png';
    if (Array.isArray(body.images) && body.images.length > 0) {
      const validImages = body.images
        .filter((img: any) => typeof img === 'string' && img.trim().length > 0)
        .slice(0, 10);
      if (validImages.length > 0) {
        processedImages = JSON.stringify(validImages);
        primaryImage = validImages[0];
      }
    } else if (typeof body.images === 'string' && body.images.trim().length > 0) {
      processedImages = body.images.trim();
    }

    const processedGoal = goal && typeof goal === 'string' ? goal.trim() : (goal ? String(goal).trim() : '');

    const newProduct = await prisma.product.create({
      data: {
        name: name.trim(),
        category: category.trim(),
        goal: processedGoal,
        price: parseFloat(price),
        purchasePrice: purchasePrice !== undefined && purchasePrice !== null ? parseFloat(purchasePrice) : null,
        image: primaryImage,
        images: processedImages || (primaryImage ? JSON.stringify([primaryImage]) : null),
        description: description ? description.trim() : '',
        portions: portions ? portions.trim() : null,
        flavor: flavor ? flavor.trim() : null,
        weight: weight ? weight.trim() : null,
        sizes: processedSizes ? processedSizes.trim() : null,
        durationInDays: durationInDays ? durationInDays.trim() : null,
        isFeatured: !!isFeatured,
        isOffer: !!isOffer,
        discount: discount !== undefined && discount !== null ? parseFloat(discount) : null,
        stock: stock !== undefined && stock !== null ? parseInt(stock) : 10,
        supplierName: supplierName ? supplierName.trim() : null,
        purchaseType: purchaseType === 'CREDITO' ? 'CREDITO' : 'CONTADO',
        creditDueDate: creditDueDate ? creditDueDate.trim() : null,
        creditDebt: creditDebt !== undefined && creditDebt !== null ? parseFloat(creditDebt) : null,
        creditPaid: !!creditPaid,
      }
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    console.error('[API PRODUCTS POST ERROR]:', error);
    return NextResponse.json(
      { error: `Error al crear el producto: ${error.message || 'Desconocido'}` },
      { status: 500 }
    );
  }
}

// PUT: Update an existing product
export async function PUT(request: Request) {
  try {
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
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'El ID del producto es requerido para realizar la actualización.' },
        { status: 400 }
      );
    }

    if (!name || !category || price === undefined || price === null) {
      return NextResponse.json(
        { error: 'El nombre, la categoría y el precio de venta son requeridos.' },
        { status: 400 }
      );
    }

    // Process sizes if it's an array
    let processedSizes = '';
    if (Array.isArray(sizes)) {
      processedSizes = sizes.join(',');
    } else if (typeof sizes === 'string') {
      processedSizes = sizes;
    }

    // Process images array (up to 10 images)
    let processedImages = '';
    let primaryImage = image ? String(image).trim() : '/protein.png';
    if (Array.isArray(body.images) && body.images.length > 0) {
      const validImages = body.images
        .filter((img: any) => typeof img === 'string' && img.trim().length > 0)
        .slice(0, 10);
      if (validImages.length > 0) {
        processedImages = JSON.stringify(validImages);
        primaryImage = validImages[0];
      }
    } else if (typeof body.images === 'string' && body.images.trim().length > 0) {
      processedImages = body.images.trim();
    }

    const processedGoal = goal && typeof goal === 'string' ? goal.trim() : (goal ? String(goal).trim() : '');

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name: name.trim(),
        category: category.trim(),
        goal: processedGoal,
        price: parseFloat(price),
        purchasePrice: purchasePrice !== undefined && purchasePrice !== null ? parseFloat(purchasePrice) : null,
        image: primaryImage,
        images: processedImages || (primaryImage ? JSON.stringify([primaryImage]) : null),
        description: description ? description.trim() : '',
        portions: portions ? portions.trim() : null,
        flavor: flavor ? flavor.trim() : null,
        weight: weight ? weight.trim() : null,
        sizes: processedSizes ? processedSizes.trim() : null,
        durationInDays: durationInDays ? durationInDays.trim() : null,
        isFeatured: !!isFeatured,
        isOffer: !!isOffer,
        discount: discount !== undefined && discount !== null ? parseFloat(discount) : null,
        stock: stock !== undefined && stock !== null ? parseInt(stock) : 10,
        supplierName: supplierName !== undefined ? (supplierName ? supplierName.trim() : null) : undefined,
        purchaseType: purchaseType !== undefined ? (purchaseType === 'CREDITO' ? 'CREDITO' : 'CONTADO') : undefined,
        creditDueDate: creditDueDate !== undefined ? (creditDueDate ? creditDueDate.trim() : null) : undefined,
        creditDebt: creditDebt !== undefined ? (creditDebt !== null ? parseFloat(creditDebt) : null) : undefined,
        creditPaid: creditPaid !== undefined ? !!creditPaid : undefined,
      }
    });

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    console.error('[API PRODUCTS PUT ERROR]:', error);
    return NextResponse.json(
      { error: `Error al actualizar el producto: ${error.message || 'Desconocido'}` },
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

    const productId = parseInt(idParam);

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

    return NextResponse.json({
      success: true,
      message: `Producto "${deletedProduct.name}" eliminado correctamente.`,
      product: deletedProduct
    });
  } catch (error: any) {
    console.error('[API PRODUCTS DELETE ERROR]:', error);
    return NextResponse.json(
      { error: `Error al eliminar el producto: ${error.message || 'Desconocido'}` },
      { status: 500 }
    );
  }
}
