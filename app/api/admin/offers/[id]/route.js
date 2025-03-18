
// app/api/admin/offers/[id]/route.js - Admin API for individual offer operations
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
    
    // const { id } = params;
    const id = params instanceof Promise ? (await params).id : params.id;

    
    const offer = await prisma.offer.findUnique({
      where: { id },
      include: {
        brand: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    if (!offer) {
      return NextResponse.json(
        { error: "Offer not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ offer });
  } catch (error) {
    console.error("Error fetching offer:", error);
    return NextResponse.json(
      { error: "Failed to fetch offer" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // const { id } = params;
    const id = params instanceof Promise ? (await params).id : params.id;

    const data = await request.json();
    
    // Check if offer exists
    const existingOffer = await prisma.offer.findUnique({
      where: { id }
    });
    
    if (!existingOffer) {
      return NextResponse.json(
        { error: "Offer not found" },
        { status: 404 }
      );
    }
    
    // Process dates
    const updatedData = {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : null
    };
    
    const offer = await prisma.offer.update({
      where: { id },
      data: updatedData
    });
    
    return NextResponse.json({ offer });
  } catch (error) {
    console.error("Error updating offer:", error);
    return NextResponse.json(
      { error: "Failed to update offer" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // const { id } = params;
    const id = params instanceof Promise ? (await params).id : params.id;
    
    // Check if offer exists
    const existingOffer = await prisma.offer.findUnique({
      where: { id }
    });
    
    if (!existingOffer) {
      return NextResponse.json(
        { error: "Offer not found" },
        { status: 404 }
      );
    }
    
    await prisma.offer.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting offer:", error);
    return NextResponse.json(
      { error: "Failed to delete offer" },
      { status: 500 }
    );
  }
}