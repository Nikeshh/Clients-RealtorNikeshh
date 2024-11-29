import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';
import { sendEmail } from '../../email/route';

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const { propertyId, clientId } = await request.json();

    if (!propertyId || !clientId) {
      return NextResponse.json(
        { error: 'Property ID and Client ID are required' },
        { status: 400 }
      );
    }

    // Get client and property details
    const [client, property] = await Promise.all([
      prisma.client.findUnique({ where: { id: clientId } }),
      prisma.property.findUnique({ where: { id: propertyId } }),
    ]);

    if (!client || !property) {
      return NextResponse.json(
        { error: 'Client or Property not found' },
        { status: 404 }
      );
    }

    // Create share record
    const sharedProperty = await prisma.sharedProperty.create({
      data: {
        propertyId,
        clientId,
        status: 'Shared',
        sharedDate: new Date(),
      },
      include: {
        client: true,
        property: true,
      },
    });

    // Create an interaction record
    await prisma.interaction.create({
      data: {
        clientId,
        type: 'Property Shared',
        description: `Shared property: ${property.title}`,
        date: new Date(),
      },
    });

    // Send email using the email API endpoint with absolute URL
    await sendEmail(client.email, client.name, [property]);

    return NextResponse.json(sharedProperty);
  } catch (error) {
    console.error('Error sharing property:', error);
    return NextResponse.json(
      { error: 'Failed to share property' },
      { status: 500 }
    );
  }
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    const sharedProperties = await prisma.sharedProperty.findMany({
      where: {
        clientId: clientId,
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            price: true,
            images: true,
            status: true,
            listingType: true,
          },
        },
      },
      orderBy: {
        sharedDate: 'desc',
      },
    });

    return NextResponse.json(sharedProperties);
  } catch (error) {
    console.error('Error fetching shared properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shared properties' },
      { status: 500 }
    );
  }
} 