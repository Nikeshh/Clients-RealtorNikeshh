import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/clients - Get all clients
export async function GET() {
  try {
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
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Error fetching clients' },
      { status: 500 }
    );
  }
}

// POST /api/clients - Create a new client
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { requirements, ...clientData } = body;

    const client = await prisma.client.create({
      data: {
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone,
        status: clientData.status || 'Active',
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
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Error creating client' },
      { status: 500 }
    );
  }
} 