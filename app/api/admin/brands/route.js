// app/api/admin/brands/route.js - Admin API to create and manage brands
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    
    const skip = (page - 1) * limit;
    
    const where = search 
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ]
        } 
      : {};
    
    // const [brands, total] = await Promise.all([
    //   prisma.brand.findMany({
    //     where,
    //     include: {
    //       _count: {
    //         select: {
    //           offers: true,
    //           images: true
    //         }
    //       }
    //     },
    //     skip,
    //     take: limit,
    //     orderBy: { createdAt: 'desc' }
    //   }),
    //   prisma.brand.count({ where })
    // ]);
    const [brands, total] = await Promise.all([
      prisma.brand.findMany({
        where,
        include: {
          _count: {
            select: {
              offers: {
                where: {
                  active: true
                }
              },
              images: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.brand.count({ where })
    ]);
    
    return NextResponse.json({
      brands,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching brands for admin:", error);
    return NextResponse.json(
      { error: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const data = await request.json();
    
    // Validation
    const { name, logo, description } = data;
    if (!name || !logo || !description) {
      return NextResponse.json(
        { error: "Name, logo and description are required" },
        { status: 400 }
      );
    }
    
    const brand = await prisma.brand.create({
      data
    });
    
    return NextResponse.json({ brand }, { status: 201 });
  } catch (error) {
    console.error("Error creating brand:", error);
    return NextResponse.json(
      { error: "Failed to create brand" },
      { status: 500 }
    );
  }
}