import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const POST = withAuth(async (req: NextRequest) => {
  try {
    const { clientId, propertyIds } = await req.json();

    // Create shared property records
    const sharedProperties = await Promise.all(
      propertyIds.map((propertyId: string) =>
        prisma.sharedProperty.create({
          data: {
            clientId,
            propertyId,
            status: 'Shared',
          },
          include: {
            property: true,
            client: true,
          },
        })
      )
    );

    // Create an interaction record for the sharing
    await prisma.interaction.create({
      data: {
        clientId,
        type: 'Property Share',
        description: `Shared ${propertyIds.length} properties`,
        date: new Date(),
      },
    });

    return NextResponse.json(sharedProperties);
  } catch (error) {
    console.error('Error sharing properties:', error);
    return NextResponse.json(
      { error: 'Failed to share properties' },
      { status: 500 }
    );
  }
}); 