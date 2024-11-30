import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const id = request.url.split('/clients/')[1].split('/interactions')[0];
    const { type, description, notes, stageId, requirementId } = await request.json();

    const interaction = await prisma.interaction.create({
      data: {
        clientId: id,
        type,
        description,
        notes,
        date: new Date(),
        stageId: stageId || undefined,
        requirementId: requirementId || undefined,
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
    const id = request.url.split('/clients/')[1].split('/interactions')[0];

    const interactions = await prisma.interaction.findMany({
      where: { clientId: id },
      orderBy: { date: 'desc' },
      include: {
        requirement: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
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