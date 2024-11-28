import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

// GET /api/clients - Get all clients
export const GET = withAuth(async (req: NextRequest) => {
  try {
    const clients = await prisma.client.findMany({
      orderBy: [
        { pinned: 'desc' },  // Sort pinned clients first
        { createdAt: 'desc' }
      ],
      include: {
        requirements: true,
        interactions: {
          take: 1,
          orderBy: {
            date: 'desc'
          }
        }
      }
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

// POST /api/clients - Create a new client
export const POST = withAuth(async (req: NextRequest) => {
  try {
    const data = await req.json();
    
    const client = await prisma.client.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        status: data.status || "Active",
        requirements: {
          create: {
            propertyType: data.requirements.propertyType,
            budgetMin: parseFloat(data.requirements.budgetMin),
            budgetMax: parseFloat(data.requirements.budgetMax),
            bedrooms: data.requirements.bedrooms ? parseInt(data.requirements.bedrooms) : null,
            bathrooms: data.requirements.bathrooms ? parseInt(data.requirements.bathrooms) : null,
            preferredLocations: data.requirements.preferredLocations,
            additionalRequirements: data.requirements.additionalRequirements,
          }
        },
        interactions: {
          create: {
            type: 'Created',
            description: 'Client profile created',
            date: new Date(),
          }
        }
      },
      include: {
        requirements: true,
        interactions: true,
      }
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