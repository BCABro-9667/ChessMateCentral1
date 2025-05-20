
// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

// Ensure the uploads directory exists
const ensureUploadsDirExists = async () => {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  try {
    await mkdir(uploadsDir, { recursive: true });
  } catch (error) {
    // Ignore error if directory already exists
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      console.error('Failed to create uploads directory:', error);
      throw error; // Re-throw if it's not an EEXIST error
    }
  }
};

export async function POST(request: NextRequest) {
  try {
    await ensureUploadsDirExists();
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate a unique filename
    const extension = path.extname(file.name);
    const uniqueFilename = `${randomUUID()}${extension}`;
    const uploadPath = path.join(process.cwd(), 'public', 'uploads', uniqueFilename);

    await writeFile(uploadPath, buffer);
    
    const fileUrl = `/uploads/${uniqueFilename}`; // URL path relative to the public folder

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ success: false, message: 'File upload failed.', error: (error as Error).message }, { status: 500 });
  }
}
