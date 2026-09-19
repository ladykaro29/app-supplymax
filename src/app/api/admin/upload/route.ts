import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo.' }, { status: 400 });
    }

    // Validate mime type
    const validMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'image/avif',
    ];

    if (!validMimes.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: 'Formato no permitido. Sube una imagen PNG, JPG, WEBP, GIF o AVIF.' },
        { status: 400 }
      );
    }

    // Limit to 15MB
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'La imagen excede el límite máximo permitido de 15MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename
    const originalName = file.name || 'image.png';
    const ext = path.extname(originalName) || '.png';
    const baseName = path
      .basename(originalName, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .slice(0, 30);

    const filename = `product_${Date.now()}_${baseName}${ext.toLowerCase()}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    // Ensure uploads directory exists
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({
      url: publicUrl,
      filename,
      success: true,
    });
  } catch (error: any) {
    console.error('Error handling upload:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno al procesar y guardar la imagen.' },
      { status: 500 }
    );
  }
}
