import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withErrorHandler } from '@/lib/middleware/error';

interface RouteParams {
  params: {
    id: string;
  };
}

// POST /api/properties/[id]/share - Share a property with clients
export const POST = withErrorHandler(async (request: Request, { params }: RouteParams) => {
  const body = await request.json();
  const { clientIds } = body;

  // Verify property exists
  const property = await prisma.property.findUnique({
    where: { id: params.id }
  });

  if (!property) {
    return NextResponse.json(
      { error: 'Property not found' },
      { status: 404 }
    );
  }

  // Create shared property records
  const shares = await Promise.all(
    clientIds.map(async (clientId: string) => {
      // Check if already shared
      const existing = await prisma.sharedProperty.findFirst({
        where: {
          propertyId: params.id,
          clientId: clientId
        }
      });

      if (existing) {
        return existing;
      }

      // Create new share
      return prisma.sharedProperty.create({
        data: {
          propertyId: params.id,
          clientId: clientId,
          status: 'Shared'
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
    })
  );

  return NextResponse.json({
    success: true,
    shares
  });
});

// GET /api/properties/[id]/share - Get all clients this property is shared with
export const GET = withErrorHandler(async (request: Request, { params }: RouteParams) => {
  const shares = await prisma.sharedProperty.findMany({
    where: {
      propertyId: params.id
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true,
          status: true
        }
      }
    }
  });

  return NextResponse.json(shares);
}); 