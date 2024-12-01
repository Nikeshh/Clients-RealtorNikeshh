import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const clientId = request.url.split('/clients/')[1].split('/')[0];
    const { type, description, requestId, requirementId } = await request.json();

    const interaction = await prisma.interaction.create({
      data: {
        clientId,
        type,
        description,
        requestId,
        requirementId,
      },
    });

    return NextResponse.json(interaction);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to create interaction' },
      { status: 500 }
    );
  }
});

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const clientId = request.url.split('/clients/')[1].split('/')[0];

    const interactions = await prisma.interaction.findMany({
      where: { clientId },
      orderBy: { date: 'desc' },
      include: {
        request: true,
        requirement: true,
      },
    });

    return NextResponse.json(interactions);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interactions' },
      { status: 500 }
    );
  }
}); 