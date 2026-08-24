import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const bookingId = formData.get('bookingId') || 'temp';
    
    if (!file) {
      return NextResponse.json({ error: 'No receipt file provided' }, { status: 400 });
    }

    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/pdf'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Only image files (JPG, PNG, WEBP) and PDF documents are allowed' 
      }, { status: 400 });
    }

    const MAX_SIZE = 8 * 1024 * 1024; // 8MB max
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Receipt file too large. Max 8MB allowed.' }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || 'AIzaSyA3Q9bwzj9Xr05ha_gMIMrg-pOTIhSeCTI';
    const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || 'orluxus.firebasestorage.app';
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    let ext = 'jpg';
    if (file.type === 'application/pdf') {
      ext = 'pdf';
    } else if (file.type.includes('png')) {
      ext = 'png';
    } else if (file.type.includes('webp')) {
      ext = 'webp';
    }
    
    const safeBookingPrefix = String(bookingId).replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `receipts/${safeBookingPrefix}_${timestamp}_${randomStr}.${ext}`;
    const encodedFilename = encodeURIComponent(filename);
    
    const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?uploadType=media&name=${encodedFilename}&key=${apiKey}`;
    
    let downloadUrl = null;

    try {
      const uploadRes = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': file.type,
          'Content-Length': buffer.length.toString(),
        },
        body: buffer,
      });

      if (uploadRes.ok) {
        downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedFilename}?alt=media`;
      } else {
        const errText = await uploadRes.text();
        console.warn('Firebase Storage upload error for receipt:', errText);
      }
    } catch (fbErr) {
      console.warn('Firebase upload network error:', fbErr);
    }

    if (!downloadUrl) {
      try {
        const publicDir = path.join(process.cwd(), 'public');
        const uploadsDir = path.join(publicDir, 'uploads', 'receipts');
        fs.mkdirSync(uploadsDir, { recursive: true });
        
        const localFilename = `${safeBookingPrefix}_${timestamp}_${randomStr}.${ext}`;
        const filePath = path.join(uploadsDir, localFilename);
        fs.writeFileSync(filePath, buffer);
        
        downloadUrl = `/uploads/receipts/${localFilename}`;
      } catch (localErr) {
        console.error('Local receipt upload fallback failed:', localErr);
        return NextResponse.json({ error: 'Receipt upload failed on server' }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      success: true,
      url: downloadUrl,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    });
    
  } catch (err) {
    console.error('Receipt upload error:', err);
    return NextResponse.json({ error: 'Server error during receipt upload' }, { status: 500 });
  }
}