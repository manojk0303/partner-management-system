// api/admin/brands/[id]/offers/route.js
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Handle params as potentially being a promise
    const id = params instanceof Promise ? (await params).id : params.id;
    
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
    
    const offers = await prisma.offer.findMany({
      where: { brandId: id },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json({ offers });
  } catch (error) {
    console.error("Error fetching offers:", error);
    return NextResponse.json(
      { error: "Failed to fetch offers" },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const id = params instanceof Promise ? (await params).id : params.id;
    
    const data = await request.json();
    
    // Validation
    const { title, description, startDate } = data;
    if (!title || !description || !startDate) {
      return NextResponse.json(
        { error: "Title, description and start date are required" },
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
    
    const offer = await prisma.offer.create({
      data: {
        ...data,
        brandId: id
      }
    });
    
    return NextResponse.json(offer, { status: 201 });
  } catch (error) {
    console.error("Error creating offer:", error);
    return NextResponse.json(
      { error: "Failed to create offer" },
      { status: 500 }
    );
  }
}