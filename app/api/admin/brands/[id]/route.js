// api/admin/brands/[id]/route.js
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request, context) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Extract the id from params properly - now with await
    const params = context.params;
    // Handle params as potentially being a promise
    const id = params instanceof Promise ? (await params).id : params.id;
    
    // Log the ID for debugging
    console.log(`Fetching brand with ID: ${id}`);
    
    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        images: true,
        offers: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    if (!brand) {
      return NextResponse.json(
        { error: "Brand not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ brand });
  } catch (error) {
    console.error("Error fetching brand for admin:", error);
    return NextResponse.json(
      { error: "Failed to fetch brand", details: error.message },
      { status: 500 }
    );
  }
}

// Update your file: app/api/admin/brands/[id]/route.js
// Only the PUT method is shown here, as that's where the issue was

export async function PUT(request, context) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Extract the id from params properly
    const params = context.params;
    const id = params instanceof Promise ? (await params).id : params.id;
    
    const data = await request.json();
    
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
    
    // Remove relationship fields that shouldn't be directly updated
    const { images, offers, createdAt, updatedAt, ...updateData } = data;
    
    // Now update the brand with clean data
    const brand = await prisma.brand.update({
      where: { id },
      data: updateData,
      include: {
        images: true
      }
    });
    
    return NextResponse.json({ brand });
  } catch (error) {
    console.error("Error updating brand:", error);
    return NextResponse.json(
      { error: "Failed to update brand", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, context) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Extract the id from params properly - now with await
    const params = context.params;
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
    
    // Delete the brand (cascade deletion will handle related records)
    await prisma.brand.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting brand:", error);
    return NextResponse.json(
      { error: "Failed to delete brand", details: error.message },
      { status: 500 }
    );
  }
}