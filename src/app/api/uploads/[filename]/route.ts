import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MIME_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
};

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params;
    if (!filename) {
      return new NextResponse('Archivo no especificado', { status: 400 });
    }

    // Sanitize filename to prevent directory traversal
    const safeFilename = path.basename(decodeURIComponent(filename));
    const filePath = path.join(process.cwd(), 'public', 'uploads', safeFilename);

    await stat(filePath);
    const fileBuffer = await readFile(filePath);
    const ext = path.extname(safeFilename).toLowerCase();
    const contentType = MIME_MAP[ext] || 'image/jpeg';

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    // Fallback to default product placeholder if file is missing
    try {
      const fallbackPath = path.join(process.cwd(), 'public', 'protein.png');
      const fallbackBuffer = await readFile(fallbackPath);
      return new NextResponse(fallbackBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } catch {
      return new NextResponse('Imagen no encontrada', { status: 404 });
    }
  }
}

