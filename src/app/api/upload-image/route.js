import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only image files are allowed (jpg, png, webp, gif)' }, { status: 400 });
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB max
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Max 10MB allowed.' }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || 'AIzaSyA3Q9bwzj9Xr05ha_gMIMrg-pOTIhSeCTI';
    const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || 'orluxus.firebasestorage.app';
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
    const filename = `trips/${timestamp}_${randomStr}.${ext}`;
    const encodedFilename = encodeURIComponent(filename);
    
    // Upload to Firebase Storage REST API
    const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?uploadType=media&name=${encodedFilename}&key=${apiKey}`;
    
    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': file.type,
        'Content-Length': buffer.length.toString(),
      },
      body: buffer,
    });

    let useLocalFallback = false;
    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error('Firebase Storage upload error:', errText);
      useLocalFallback = true;
    }

    if (useLocalFallback) {
      try {
        const fs = require('fs').promises;
        const path = require('path');
        const publicDir = path.join(process.cwd(), 'public');
        const uploadsDir = path.join(publicDir, 'uploads');
        
        // Ensure uploads directory exists
        await fs.mkdir(uploadsDir, { recursive: true });
        
        const localFilename = `${timestamp}_${randomStr}.${ext}`;
        const filePath = path.join(uploadsDir, localFilename);
        await fs.writeFile(filePath, buffer);
        
        console.log('Successfully saved image locally:', `/uploads/${localFilename}`);
        return NextResponse.json({ url: `/uploads/${localFilename}` });
      } catch (localErr) {
        console.error('Local upload fallback failed:', localErr);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
      }
    }

    // Build public download URL
    const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedFilename}?alt=media`;
    
    return NextResponse.json({ url: downloadUrl });
    
  } catch (err) {
    console.error('Image upload error:', err);
    return NextResponse.json({ error: 'Server error during upload' }, { status: 500 });
  }
}
