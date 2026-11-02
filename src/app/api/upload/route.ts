import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.formData();
    
    // Support both multiple ('files') and single/multiple ('file') form field names
    const uploadedFiles: File[] = [];
    const filesList = [...data.getAll('files'), ...data.getAll('file')];
    for (const f of filesList) {
      if (f && typeof f === 'object' && typeof (f as any).arrayBuffer === 'function') {
        uploadedFiles.push(f as File);
      }
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json({ error: 'No valid image file uploaded' }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    let dirExists = existsSync(uploadsDir);
    if (!dirExists) {
      try {
        await mkdir(uploadsDir, { recursive: true });
        dirExists = true;
      } catch (mkdirErr) {
        console.warn('Could not create uploads directory, using data URL fallback:', mkdirErr);
      }
    }

    const results: Array<{ url: string; fileName: string; originalName: string }> = [];

    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const cleanFileName = (file.name || 'image.jpg').replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueFileName = `${Date.now()}_${i}_${cleanFileName}`;

      let fileUrl = '';

      if (dirExists) {
        try {
          const filePath = path.join(uploadsDir, uniqueFileName);
          await writeFile(filePath, buffer);
          fileUrl = `/uploads/${uniqueFileName}`;
        } catch (fsErr) {
          console.warn('Filesystem write failed, falling back to data URL:', fsErr);
          const mimeType = file.type || 'image/jpeg';
          const base64 = buffer.toString('base64');
          fileUrl = `data:${mimeType};base64,${base64}`;
        }
      } else {
        const mimeType = file.type || 'image/jpeg';
        const base64 = buffer.toString('base64');
        fileUrl = `data:${mimeType};base64,${base64}`;
      }

      results.push({
        url: fileUrl,
        fileName: uniqueFileName,
        originalName: file.name,
      });
    }

    return NextResponse.json({
      success: true,
      url: results[0].url,
      fileName: results[0].fileName,
      files: results,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
