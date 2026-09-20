import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Support multiple files from 'files' or 'file'
    let files = formData.getAll('files') as File[];
    if (!files || files.length === 0) {
      const single = formData.getAll('file') as File[];
      if (single && single.length > 0) {
        files = single;
      }
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No se envió ningún archivo.' }, { status: 400 });
    }

    // Maximum 10 files per upload batch
    if (files.length > 10) {
      files = files.slice(0, 10);
    }

    // Validate mime types
    const validMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'image/avif',
    ];

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!validMimes.includes(file.type.toLowerCase())) {
        continue;
      }

      // Limit to 15MB each
      const MAX_SIZE = 15 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        continue;
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const originalName = file.name || `image_${i}.png`;
      const ext = path.extname(originalName) || '.png';
      const baseName = path
        .basename(originalName, ext)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .slice(0, 30);

      const filename = `product_${Date.now()}_${i}_${baseName}${ext.toLowerCase()}`;
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, buffer);

      uploadedUrls.push(`/uploads/${filename}`);
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json(
        { error: 'No se pudieron procesar las imágenes. Verifica que sean formatos válidos (PNG, JPG, WEBP).' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      url: uploadedUrls[0],
      urls: uploadedUrls,
      count: uploadedUrls.length,
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
