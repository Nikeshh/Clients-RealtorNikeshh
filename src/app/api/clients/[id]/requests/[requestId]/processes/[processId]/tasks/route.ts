import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const processId = request.url.split('/processes/')[1].split('/')[0];
    const { type } = await request.json();

    const task = await prisma.processTask.create({
      data: {
        processId,
        type,
        status: 'PENDING',
      },
    });

    // Create an interaction for task creation
    await prisma.interaction.create({
      data: {
        clientId: request.url.split('/clients/')[1].split('/')[0],
        type: 'TASK_CREATED',
        description: `New ${type} task created`,
        requestId: request.url.split('/requests/')[1].split('/')[0],
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
});

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const processId = request.url.split('/processes/')[1].split('/')[0];

    const tasks = await prisma.processTask.findMany({
      where: { processId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}); 