import { adminStorage } from '@/lib/firebase-admin';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    
    // Create buffer from file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create unique filename
    const originalName = file.name;
    const fileExtension = originalName.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    
    // Upload file using admin SDK
    const bucket = adminStorage.bucket();
    const fileRef = bucket.file(`brands/${fileName}`);
    
    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
      }
    });
    
    // Get the public URL
    const [url] = await fileRef.getSignedUrl({
      action: 'read',
      expires: '01-01-2500', // Far future expiration
    });
    
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Error uploading file to Firebase:", error);
    return NextResponse.json(
      { error: "Failed to upload file", details: error.message },
      { status: 500 }
    );
  }
}