import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const clients = await prisma.client.findMany({
      include: {
        stages: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const data = await request.json();

    const client = await prisma.client.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        status: data.status || 'Active',
        notes: data.notes,
      },
      include: {
        stages: true,
      },
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}); 