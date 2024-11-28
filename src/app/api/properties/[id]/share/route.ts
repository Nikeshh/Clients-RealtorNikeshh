import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

// POST /api/properties/[id]/share - Share a property with clients
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const body = await request.json();
    const { clientIds } = body;

    const shares = await Promise.all(
      clientIds.map((clientId: string) =>
        prisma.sharedProperty.create({
          data: {
            propertyId: params.id,
            clientId: clientId,
            status: 'Shared'
          }
        })
      )
    );

    return NextResponse.json(shares);
  } catch (error) {
    console.error('Error sharing property:', error);
    return NextResponse.json(
      { error: 'Error sharing property' },
      { status: 500 }
    );
  }
} 