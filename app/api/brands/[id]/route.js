
// app/api/brands/[id]/route.js - Public API to get a specific brand with offers
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const id = params instanceof Promise ? (await params).id : params.id;
    
    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        images: true,
        offers: {
          where: { 
            active: true,
            startDate: { lte: new Date() },
            OR: [
              { endDate: null },
              { endDate: { gte: new Date() } }
            ]
          },
          orderBy: { startDate: 'desc' }
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
    console.error("Error fetching brand:", error);
    return NextResponse.json(
      { error: "Failed to fetch brand" },
      { status: 500 }
    );
  }
}
