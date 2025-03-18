
// app/api/admin/brands/[id]/images/route.js - Admin API for brand images
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
// In a real app, you would use a service like AWS S3 or similar for image uploads

export async function POST(request, { params }) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // const { id } = params;
    const id = params instanceof Promise ? (await params).id : params.id;

    const data = await request.json();
    
    // Validation
    if (!data.url) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }
    
    // Check if brand exists
    const existingBrand = await prisma.brand.findUnique({
      where: { id }
    });
    
    if (!existingBrand) {
      return NextResponse.json(
        { error: "Brand not found" },
        { status: 404 }
      );
    }
    
    const image = await prisma.image.create({
      data: {
        url: data.url,
        altText: data.altText || `${existingBrand.name} image`,
        brandId: id
      }
    });
    
    return NextResponse.json({ image }, { status: 201 });
  } catch (error) {
    console.error("Error adding image:", error);
    return NextResponse.json(
      { error: "Failed to add image" },
      { status: 500 }
    );
  }
}
