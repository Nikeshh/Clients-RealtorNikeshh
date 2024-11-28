import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

// GET /api/clients - Get all clients
export const GET = withAuth(async (req: NextRequest) => {
  try {
    const clients = await prisma.client.findMany({
      orderBy: [
        { pinned: 'desc' },
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

// POST /api/clients - Create a new client or validate
export const POST = withAuth(async (req: NextRequest) => {
  try {
    const data = await req.json();
    
    // Handle validation request
    if (data.action === 'validate') {
      const existingClients = await prisma.client.findMany({
        where: {
          OR: [
            { name: { equals: data.name, mode: 'insensitive' } },
            { email: { equals: data.email, mode: 'insensitive' } },
            { phone: data.phone }
          ]
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        }
      });

      if (existingClients.length > 0) {
        return NextResponse.json({
          exists: true,
          matches: existingClients,
          message: 'Similar clients found'
        }, { status: 409 });
      }

      return NextResponse.json({ exists: false });
    }

    // Handle client creation
    if (data.forceCreate || !(await checkForExistingClient(data))) {
      const client = await prisma.client.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          status: data.status || "Active",
          pinned: false,
          requirements: {
            create: {
              name: "Initial Requirement",
              propertyType: data.requirements.propertyType,
              budgetMin: parseFloat(data.requirements.budgetMin),
              budgetMax: parseFloat(data.requirements.budgetMax),
              bedrooms: data.requirements.bedrooms ? parseInt(data.requirements.bedrooms) : null,
              bathrooms: data.requirements.bathrooms ? parseInt(data.requirements.bathrooms) : null,
              preferredLocations: data.requirements.preferredLocations || [],
              additionalRequirements: data.requirements.additionalRequirements || null,
              status: "Active"
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
    }

    return NextResponse.json(
      { error: 'Client already exists' },
      { status: 409 }
    );
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
});

async function checkForExistingClient(data: any) {
  const existingClient = await prisma.client.findFirst({
    where: {
      OR: [
        { name: { equals: data.name, mode: 'insensitive' } },
        { email: { equals: data.email, mode: 'insensitive' } },
        { phone: data.phone }
      ]
    }
  });

  return existingClient !== null;
} 