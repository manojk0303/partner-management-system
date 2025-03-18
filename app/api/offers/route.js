
// app/api/offers/route.js - Public API to get all active offers
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const brandId = searchParams.get('brandId') || null;
    
    const skip = (page - 1) * limit;
    
    const where = {
      active: true,
      startDate: { lte: new Date() },
      OR: [
        { endDate: null },
        { endDate: { gte: new Date() } }
      ],
      ...(brandId && { brandId })
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
        orderBy: { startDate: 'desc' }
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
    console.error("Error fetching offers:", error);
    return NextResponse.json(
      { error: "Failed to fetch offers" },
      { status: 500 }
    );
  }
}
