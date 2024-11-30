import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

// GET /api/clients/[id]/process/tasks - Get all process tasks for a client
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const id = request.url.split('/clients/')[1].split('/process')[0];

    const tasks = await prisma.processAction.findMany({
      where: { clientId: id },
      include: {
        tasks: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(tasks);
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
    const id = request.url.split('/clients/')[1].split('/process')[0];
    const { task } = await request.json();

    const newTask = await prisma.processAction.create({
      data: {
        clientId: id,
        title: task.title,
        description: task.description,
        type: task.type,
        status: 'PENDING',
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        tasks: {
          create: task.automatedTasks.map((t: any) => ({
            type: t.type,
            status: 'PENDING'
          }))
        }
      },
      include: {
        tasks: true,
        client: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });

    // Create an interaction record
    await prisma.interaction.create({
      data: {
        clientId: id,
        type: 'Process',
        description: `Added process task: ${newTask.title}`,
        date: new Date(),
      }
    });

    return NextResponse.json(newTask);
  } catch (error) {
    console.error('Error creating process task:', error);
    return NextResponse.json(
      { error: 'Failed to create process task' },
      { status: 500 }
    );
  }
}); 