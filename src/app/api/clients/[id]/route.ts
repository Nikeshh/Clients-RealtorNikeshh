import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/clients/[id] - Get a single client
export async function GET(request: Request, { params }: RouteParams) {
  try {
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
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json(
      { error: 'Error fetching client' },
      { status: 500 }
    );
  }
}

// PATCH /api/clients/[id] - Update a client
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const body = await request.json();
    const { requirements, ...clientData } = body;

    const client = await prisma.client.update({
      where: {
        id: params.id
      },
      data: {
        ...clientData,
        requirements: requirements ? {
          upsert: {
            create: requirements,
            update: requirements
          }
        } : undefined
      },
      include: {
        requirements: true
      }
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { error: 'Error updating client' },
      { status: 500 }
    );
  }
}

// DELETE /api/clients/[id] - Delete a client
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    await prisma.client.delete({
      where: {
        id: params.id
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: 'Error deleting client' },
      { status: 500 }
    );
  }
} 