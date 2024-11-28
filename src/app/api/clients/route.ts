import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withErrorHandler } from '@/lib/middleware/error';
import type { Client, ClientFormData } from '@/types/client';

// GET /api/clients - Get all clients
export const GET = withErrorHandler(async () => {
  const clients = await prisma.client.findMany({
    include: {
      requirements: true,
      interactions: {
        orderBy: {
          date: 'desc'
        },
        take: 5 // Only get the 5 most recent interactions
      }
    }
  });
  return NextResponse.json(clients);
});

// POST /api/clients - Create a new client
export const POST = withErrorHandler(async (request: Request) => {
  const body = await request.json() as ClientFormData;
  const { requirements, ...clientData } = body;

  const client = await prisma.client.create({
    data: {
      ...clientData,
      requirements: {
        create: {
          propertyType: requirements.propertyType,
          budgetMin: requirements.budgetMin,
          budgetMax: requirements.budgetMax,
          bedrooms: requirements.bedrooms,
          bathrooms: requirements.bathrooms,
          preferredLocations: requirements.preferredLocations,
          additionalRequirements: requirements.additionalRequirements
        }
      }
    },
    include: {
      requirements: true
    }
  });

  return NextResponse.json(client);
}); 