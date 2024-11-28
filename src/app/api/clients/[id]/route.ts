import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withErrorHandler } from '@/lib/middleware/error';
import type { ClientFormData } from '@/types/client';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/clients/[id] - Get a single client
export const GET = withErrorHandler(async (request: Request, { params }: RouteParams) => {
  const client = await prisma.client.findUnique({
    where: {
      id: params.id
    },
    include: {
      requirements: true,
      interactions: {
        orderBy: {
          date: 'desc'
        }
      },
      sharedProperties: {
        include: {
          property: true
        }
      }
    }
  });

  if (!client) {
    return NextResponse.json(
      { error: 'Client not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(client);
});

// PATCH /api/clients/[id] - Update a client
export const PATCH = withErrorHandler(async (request: Request, { params }: RouteParams) => {
  const body = await request.json() as ClientFormData;
  const { requirements, ...clientData } = body;

  const client = await prisma.client.update({
    where: {
      id: params.id
    },
    data: {
      ...clientData,
      requirements: {
        upsert: {
          create: requirements,
          update: requirements
        }
      }
    },
    include: {
      requirements: true
    }
  });

  return NextResponse.json(client);
});

// DELETE /api/clients/[id] - Delete a client
export const DELETE = withErrorHandler(async (request: Request, { params }: RouteParams) => {
  await prisma.client.delete({
    where: {
      id: params.id
    }
  });

  return new NextResponse(null, { status: 204 });
}); 