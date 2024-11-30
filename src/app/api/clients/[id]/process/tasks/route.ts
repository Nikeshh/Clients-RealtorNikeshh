import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

type ProcessTaskData = {
  type: 'EMAIL' | 'DOCUMENT_REQUEST' | 'CALENDAR_INVITE';
  to?: string;
  subject?: string;
  content?: string;
  stageId: string;
  title: string;
  description: string;
  dueDate?: Date;
  suggestedDate?: Date;
};

// GET /api/clients/[id]/process/tasks - Get all process tasks
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const stageId = searchParams.get('stageId');

    if (!stageId) {
      return NextResponse.json(
        { error: 'Stage ID is required' },
        { status: 400 }
      );
    }

    const processes = await prisma.process.findMany({
      where: { stageId },
      include: {
        tasks: true,
        stage: {
          include: {
            client: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json(processes);
  } catch (error) {
    console.error('Error fetching process tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch process tasks' },
      { status: 500 }
    );
  }
});

// POST /api/clients/[id]/process/tasks - Create a new process task
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const { stageId, task } = await request.json();

    if (!stageId) {
      return NextResponse.json(
        { error: 'Stage ID is required' },
        { status: 400 }
      );
    }

    // Get stage details for notifications
    const stage = await prisma.stage.findUnique({
      where: { id: stageId },
      include: {
        client: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });

    if (!stage) {
      return NextResponse.json(
        { error: 'Stage not found' },
        { status: 404 }
      );
    }

    // Create the process with its tasks
    const newProcess = await prisma.process.create({
      data: {
        stageId,
        title: task.title,
        description: task.description,
        type: task.type,
        status: 'PENDING',
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        tasks: {
          create: task.automatedTasks.map((autoTask: { type: string }) => ({
            type: autoTask.type as 'EMAIL' | 'DOCUMENT_REQUEST' | 'CALENDAR_INVITE',
            status: 'PENDING'
          }))
        }
      },
      include: {
        tasks: true,
        stage: {
          include: {
            client: {
              select: {
                email: true,
                name: true
              }
            }
          }
        }
      }
    });

    // Process automated tasks
    for (const autoTask of newProcess.tasks) {
      if (stage.client.email) {
        const taskData: ProcessTaskData = {
          type: autoTask.type as 'EMAIL' | 'DOCUMENT_REQUEST' | 'CALENDAR_INVITE',
          stageId,
          title: newProcess.title,
          description: newProcess.description || ''
        };

        switch (autoTask.type) {
          case 'EMAIL':
            taskData.to = stage.client.email;
            taskData.subject = `Action Required: ${newProcess.title}`;
            taskData.content = `Dear ${stage.client.name},\n\n${newProcess.description}\n\nBest regards,\nYour Agent`;
            break;

          case 'DOCUMENT_REQUEST':
            taskData.dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
            break;

          case 'CALENDAR_INVITE':
            taskData.suggestedDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days from now
            break;
        }

        await prisma.processTask.update({
          where: { id: autoTask.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date()
          }
        });
      }
    }

    // Create an interaction record
    await prisma.interaction.create({
      data: {
        stageId,
        type: 'Process',
        description: `Added process task: ${newProcess.title}`,
        date: new Date(),
      }
    });

    return NextResponse.json(newProcess);
  } catch (error) {
    console.error('Error creating process task:', error);
    return NextResponse.json(
      { error: 'Failed to create process task' },
      { status: 500 }
    );
  }
}); 