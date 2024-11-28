import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { ImportedProperty } from '@/types/property';

// GET /api/properties - Get all properties
export async function GET() {
  try {
    const properties = await prisma.property.findMany();
    return NextResponse.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { error: 'Error fetching properties' },
      { status: 500 }
    );
  }
}

// POST /api/properties - Create a new property
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const propertyData: ImportedProperty = {
      title: body.title,
      address: body.address,
      type: body.type,
      price: body.price,
      area: body.area,
      status: body.status || 'Available',
      description: body.description || null,
      features: body.features || [],
      images: body.images || [],
      bedrooms: body.bedrooms || null,
      bathrooms: body.bathrooms || null,
      source: body.source || 'Manual Entry',
      location: body.location || body.address // Use address as fallback for location
    };

    const property = await prisma.property.create({
      data: propertyData
    });

    return NextResponse.json(property);
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { error: 'Error creating property' },
      { status: 500 }
    );
  }
} 