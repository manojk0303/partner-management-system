// app/api/admin/offers/route.js
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
// This would typically have auth middleware to protect admin routes

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const brandId = searchParams.get('brandId') || null;
    
    const skip = (page - 1) * limit;
    
    const where = {
      ...(brandId && { brandId })
      // For admin, we show all offers regardless of active status or dates
    };
    
    const [offers, total] = await Promise.all([
      prisma.offer.findMany({
        where,
        include: {
          brand: {
            select: {
              id: true,
              name: true,
              logo: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.offer.count({ where })
    ]);
    
    return NextResponse.json({
      offers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching admin offers:", error);
    return NextResponse.json(
      { error: "Failed to fetch offers" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Basic validation
    if (!data.title || !data.brandId || !data.startDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Format dates properly
    const formattedData = {
      ...data,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      discountPercent: data.discountPercent ? parseInt(data.discountPercent) : null
    };
    
    const offer = await prisma.offer.create({
      data: formattedData,
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            logo: true
          }
        }
      }
    });
    
    return NextResponse.json(offer);
  } catch (error) {
    console.error("Error creating offer:", error);
    return NextResponse.json(
      { error: "Failed to create offer" },
      { status: 500 }
    );
  }
}