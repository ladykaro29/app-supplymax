import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

    // Validate mime types and image extensions (including iPhone HEIC/HEIF/Live Photo blobs)
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.avif', '.heic', '.heif'];

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    let canWriteToDisk = true;
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (mkdirErr) {
      console.warn('[UPLOAD API] Could not create uploadDir, falling back to inline data URL:', mkdirErr);
      canWriteToDisk = false;
    }

    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file || typeof file.arrayBuffer !== 'function') continue;

      const mime = (file.type || '').toLowerCase();
      const originalName = file.name || `iphone_photo_${i}.jpg`;
      let ext = (path.extname(originalName) || '').toLowerCase();

      if (!ext) {
        if (mime.includes('png')) ext = '.png';
        else if (mime.includes('webp')) ext = '.webp';
        else if (mime.includes('gif')) ext = '.gif';
        else if (mime.includes('svg')) ext = '.svg';
        else ext = '.jpg';
      }

      const isValidMime = mime.startsWith('image/') || mime === '' || mime === 'application/octet-stream';
      const isValidExt = validExtensions.includes(ext);

      if (!isValidMime && !isValidExt) {
        continue;
      }

      // Limit to 25MB each
      const MAX_SIZE = 25 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        continue;
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const baseName = path
        .basename(originalName, path.extname(originalName))
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .slice(0, 30) || `img_${i}`;

      const safeExt = validExtensions.includes(ext) ? ext : '.jpg';
      const filename = `product_${Date.now()}_${i}_${baseName}${safeExt}`;

      if (canWriteToDisk) {
        try {
          const filePath = path.join(uploadDir, filename);
          await writeFile(filePath, buffer);
          // Serve via /api/uploads/[filename] so Next.js standalone mode always resolves runtime uploads
          uploadedUrls.push(`/api/uploads/${filename}`);
          continue;
        } catch (writeErr) {
          console.warn('[UPLOAD API] Failed to write file to disk, using data URL fallback:', writeErr);
        }
      }

      // Fallback: encode directly as Data URL so upload never fails on read-only/ephemeral containers
      const effectiveMime = mime.startsWith('image/') ? mime : 'image/jpeg';
      const base64DataUrl = `data:${effectiveMime};base64,${buffer.toString('base64')}`;
      uploadedUrls.push(base64DataUrl);
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json(
        { error: 'No se pudieron procesar las imágenes. Verifica que sean fotos válidas desde tu iPhone o dispositivo.' },
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
