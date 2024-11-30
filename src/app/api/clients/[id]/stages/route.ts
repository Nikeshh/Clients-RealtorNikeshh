import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

// GET /api/clients/[id]/stages - Get all stages for a client
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const id = request.url.split('/clients/')[1].split('/stages')[0];

    const stages = await prisma.stage.findMany({
      where: { clientId: id },
      include: {
        processes: {
          include: {
            tasks: true
          }
        },
        requirements: true,
        checklist: true,
        documents: true,
        sharedProperties: {
          include: {
            property: {
              select: {
                id: true,
                title: true,
                address: true,
                price: true,
                images: true,
                status: true
              }
            }
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    });

    return NextResponse.json(stages);
  } catch (error) {
    console.error('Error fetching stages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stages' },
      { status: 500 }
    );
  }
});

// POST /api/clients/[id]/stages - Create a new stage
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const id = request.url.split('/clients/')[1].split('/stages')[0];
    const { title, description, status } = await request.json();

    // Get current highest order
    const lastStage = await prisma.stage.findFirst({
      where: { clientId: id },
      orderBy: { order: 'desc' }
    });

    const order = lastStage ? lastStage.order + 1 : 0;

    // Create the stage
    const stage = await prisma.stage.create({
      data: {
        clientId: id,
        title,
        description,
        status: status || 'ACTIVE',
        order,
        startDate: new Date(),
      }
    });

    // Create an interaction record
    await prisma.interaction.create({
      data: {
        clientId: id,
        stageId: stage.id,
        type: 'Stage',
        description: `Stage "${title}" created`,
        date: new Date(),
      }
    });

    return NextResponse.json(stage);
  } catch (error) {
    console.error('Error creating stage:', error);
    return NextResponse.json(
      { error: 'Failed to create stage' },
      { status: 500 }
    );
  }
});

// PATCH /api/clients/[id]/stages/[stageId] - Update a stage
export const PATCH = withAuth(async (request: NextRequest) => {
  try {
    const id = request.url.split('/clients/')[1].split('/stages')[0];
    const { stageId, title, description, status } = await request.json();

    const stage = await prisma.stage.update({
      where: { id: stageId },
      data: {
        title,
        description,
        status,
        endDate: status === 'COMPLETED' ? new Date() : null,
      }
    });

    // Create interaction if status is updated
    if (status) {
      await prisma.interaction.create({
        data: {
          clientId: id,
          stageId: stageId,
          type: 'Stage',
          description: `Stage "${stage.title}" marked as ${status}`,
          date: new Date(),
        }
      });
    }

    return NextResponse.json(stage);
  } catch (error) {
    console.error('Error updating stage:', error);
    return NextResponse.json(
      { error: 'Failed to update stage' },
      { status: 500 }
    );
  }
});

// DELETE /api/clients/[id]/stages/[stageId] - Delete a stage
export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const id = request.url.split('/clients/')[1].split('/stages')[0];
    const { stageId } = await request.json();

    // Get stage details before deletion
    const stage = await prisma.stage.findUnique({
      where: { id: stageId }
    });

    if (!stage) {
      return NextResponse.json(
        { error: 'Stage not found' },
        { status: 404 }
      );
    }

    // Delete the stage
    await prisma.stage.delete({
      where: { id: stageId }
    });

    // Create an interaction record for the deletion
    await prisma.interaction.create({
      data: {
        clientId: id,
        type: 'Stage',
        description: `Stage "${stage.title}" deleted`,
        date: new Date(),
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting stage:', error);
    return NextResponse.json(
      { error: 'Failed to delete stage' },
      { status: 500 }
    );
  }
}); 