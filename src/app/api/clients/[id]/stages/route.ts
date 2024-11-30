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
            property: true
          }
        },
        interactions: true
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
    const { title, description, processes } = await request.json();

    // Get the highest order number
    const lastStage = await prisma.stage.findFirst({
      where: { clientId: id },
      orderBy: { order: 'desc' }
    });

    const order = lastStage ? lastStage.order + 1 : 0;

    // Create the stage with its processes
    const stage = await prisma.stage.create({
      data: {
        clientId: id,
        title,
        description,
        order,
        status: 'ACTIVE',
        processes: {
          create: processes.map((process: any) => ({
            title: process.title,
            description: process.description,
            type: process.type,
            status: 'PENDING',
            tasks: {
              create: process.automatedTasks.map((task: any) => ({
                type: task.type,
                status: 'PENDING'
              }))
            }
          }))
        }
      },
      include: {
        processes: {
          include: {
            tasks: true
          }
        }
      }
    });

    // Create an interaction record
    await prisma.interaction.create({
      data: {
        stageId: stage.id,
        type: 'Stage',
        description: `Stage "${title}" created`,
        date: new Date()
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
    const urlParts = request.url.split('/');
    const stageId = urlParts[urlParts.length - 1];
    const { status, title, description, order } = await request.json();

    const stage = await prisma.stage.update({
      where: { id: stageId },
      data: {
        status: status || undefined,
        title: title || undefined,
        description: description || undefined,
        order: order || undefined,
        endDate: status === 'COMPLETED' ? new Date() : undefined
      },
      include: {
        processes: {
          include: {
            tasks: true
          }
        }
      }
    });

    // Create an interaction record for status change
    if (status) {
      await prisma.interaction.create({
        data: {
          stageId: stageId,
          type: 'Stage',
          description: `Stage "${stage.title}" marked as ${status}`,
          date: new Date()
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
    const urlParts = request.url.split('/');
    const stageId = urlParts[urlParts.length - 1];

    await prisma.stage.delete({
      where: { id: stageId }
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