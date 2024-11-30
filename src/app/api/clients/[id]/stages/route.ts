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
    const templates = await request.json();
    
    // Handle both single template and array of templates
    const template = Array.isArray(templates) ? templates[0] : templates;

    // Validate required fields
    if (!template || !template.title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Get current highest order
    const lastStage = await prisma.stage.findFirst({
      where: { clientId: id },
      orderBy: { order: 'desc' }
    });

    const order = lastStage ? lastStage.order + 1 : 0;

    // Create the stage and processes in a transaction
    const stage = await prisma.$transaction(async (tx) => {
      // Create the stage
      const newStage = await tx.stage.create({
        data: {
          clientId: id,
          title: template.title,
          description: template.description || '',
          status: 'ACTIVE',
          order,
          startDate: new Date(),
          processes: template.processes ? {
            create: template.processes.map((process: any) => ({
              title: process.title,
              description: process.description || '',
              type: process.type,
              status: 'PENDING',
              tasks: process.automatedTasks ? {
                create: process.automatedTasks.map((task: any) => ({
                  type: task.type,
                  status: 'PENDING'
                }))
              } : undefined
            }))
          } : undefined
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
      await tx.interaction.create({
        data: {
          clientId: id,
          stageId: newStage.id,
          type: 'Stage',
          description: `Stage "${template.title}" created`,
          date: new Date(),
        }
      });

      return newStage;
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
    const { stageId, title, description, status, checklist } = await request.json();

    // Start a transaction to handle both stage update and checklist items
    const stage = await prisma.$transaction(async (tx) => {
      // Update the stage
      const updatedStage = await tx.stage.update({
        where: { id: stageId },
        data: {
          title,
          description,
          status,
          endDate: status === 'COMPLETED' ? new Date() : null,
        },
        include: {
          checklist: true
        }
      });

      // If checklist items are provided, update them
      if (checklist) {
        // Delete existing checklist items
        await tx.stageChecklist.deleteMany({
          where: { stageId }
        });

        // Create new checklist items
        if (checklist.length > 0) {
          await tx.stageChecklist.createMany({
            data: checklist.map((item: { text: any; completed: any; }) => ({
              stageId,
              text: item.text,
              completed: item.completed || false
            }))
          });
        }
      }

      return updatedStage;
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