import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: Fetch all products from SQLite
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { id: 'asc' }
    });
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

    const newProduct = await prisma.product.create({
      data: {
        name: name.trim(),
        category: category.trim(),
        goal: goal ? goal.trim() : null,
        price: parseFloat(price),
        purchasePrice: purchasePrice !== undefined && purchasePrice !== null ? parseFloat(purchasePrice) : null,
        image: image ? image.trim() : '/protein.png', // Default placeholder if empty
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

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name: name.trim(),
        category: category.trim(),
        goal: goal ? goal.trim() : null,
        price: parseFloat(price),
        purchasePrice: purchasePrice !== undefined && purchasePrice !== null ? parseFloat(purchasePrice) : null,
        image: image ? image.trim() : '/protein.png',
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
