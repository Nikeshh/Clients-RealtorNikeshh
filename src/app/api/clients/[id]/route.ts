import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const id = request.url.split('/clients/')[1].split('/')[0];

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        stages: {
          include: {
            processes: {
              include: {
                tasks: true
              }
            },
            requirements: true,
            checklist: true,
            documents: true,
            sharedProperties: {
              include: {
                property: {
                  select: {
                    id: true,
                    title: true,
                    address: true,
                    price: true,
                    images: true,
                    status: true
                  }
                }
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        },
        interactions: {
          orderBy: {
            date: 'desc'
          },
          include: {
            stage: {
              select: {
                id: true,
                title: true
              }
            },
            requirement: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          }
        },
        documentRequests: true,
        meetings: true,
        transactions: {
          include: {
            property: {
              select: {
                id: true,
                title: true,
                address: true
              }
            }
          },
          orderBy: {
            date: 'desc'
          }
        },
        commissions: {
          include: {
            property: {
              select: {
                id: true,
                title: true,
                price: true,
                status: true
              }
            }
          }
        },
        checklist: true
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
      { error: 'Failed to fetch client' },
      { status: 500 }
    );
  }
});

export const PATCH = withAuth(async (request: NextRequest) => {
  try {
    const id = request.url.split('/clients/')[1].split('/')[0];
    const data = await request.json();

    const client = await prisma.client.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        status: data.status,
        notes: data.notes,
      },
      include: {
        stages: {
          include: {
            processes: true,
            requirements: true,
            checklist: true,
            documents: true
          }
        },
        documentRequests: true,
        meetings: true,
        transactions: true,
        commissions: true,
        checklist: true
      }
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const id = request.url.split('/clients/')[1].split('/')[0];

    await prisma.client.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    );
  }
}); 