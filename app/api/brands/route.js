// app/api/brands/route.js - Public API to get all brands
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    
    const skip = (page - 1) * limit;
    
    const where = search 
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { location: { contains: search, mode: 'insensitive' } }
          ]
        } 
      : {};
    
    const [brands, total] = await Promise.all([
      prisma.brand.findMany({
        where,
        include: {
          offers: {
            where: { 
              active: true,
              startDate: { lte: new Date() },
              OR: [
                { endDate: null },
                { endDate: { gte: new Date() } }
              ]
            },
            select: { id: true }
          },
          images: {
            take: 1,
            select: { url: true }
          }
        },
        skip,
        take: limit,
        orderBy: { name: 'asc' }
      }),
      prisma.brand.count({ where })
    ]);

    // Format the response
    const formattedBrands = brands.map(brand => ({
      id: brand.id,
      name: brand.name,
      logo: brand.logo,
      description: brand.description,
      location: brand.location,
      offersCount: brand.offers.length,
      previewImage: brand.images[0]?.url || null,
      createdAt: brand.createdAt,
      updatedAt: brand.updatedAt,
    }));

    return NextResponse.json({ 
      brands: formattedBrands, 
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { error: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}
