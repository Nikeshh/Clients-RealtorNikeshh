import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const clientId = request.url.split('/clients/')[1].split('/interactions')[0];
    const data = await request.json();

    const interaction = await prisma.interaction.create({
      data: {
        clientId,
        requirementId: data.requirementId || null,
        type: data.type,
        description: data.description,
        notes: data.notes,
        date: new Date(data.date),
      },
      include: {
        requirement: true,
      },
    });

    return NextResponse.json(interaction);
  } catch (error) {
    console.error('Error creating interaction:', error);
    return NextResponse.json(
      { error: 'Failed to create interaction' },
      { status: 500 }
    );
  }
});

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const clientId = request.url.split('/clients/')[1].split('/interactions')[0];
    const { searchParams } = new URL(request.url);
    const requirementId = searchParams.get('requirementId');

    const interactions = await prisma.interaction.findMany({
      where: {
        clientId,
        ...(requirementId && { requirementId }),
      },
      orderBy: {
        date: 'desc',
      },
      include: {
        requirement: true,
      },
    });

    return NextResponse.json(interactions);
  } catch (error) {
    console.error('Error fetching interactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interactions' },
      { status: 500 }
    );
  }
}); 