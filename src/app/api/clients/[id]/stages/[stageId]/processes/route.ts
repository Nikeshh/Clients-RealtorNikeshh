import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const POST = withAuth(async (request: NextRequest) => {
  try {
    // Extract IDs from URL
    const urlParts = request.url.split('/');
    const stageId = urlParts[urlParts.indexOf('stages') + 1];
    const data = await request.json();

    // Validate input
    if (!data || !data.title) {
      return NextResponse.json(
        { error: 'Process details are required' },
        { status: 400 }
      );
    }

    // Get stage details
    const stage = await prisma.stage.findUnique({
      where: { id: stageId },
      include: {
        client: {
          select: {
            id: true,
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

    // Create the process
    const newProcess = await prisma.process.create({
      data: {
        stageId,
        title: data.title,
        description: data.description || '',
        type: data.type || 'TASK',
        status: 'PENDING',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        tasks: data.automatedTasks ? {
          create: data.automatedTasks.map((task: { type: string }) => ({
            type: task.type,
            status: 'PENDING'
          }))
        } : undefined
      },
      include: {
        tasks: true,
        stage: {
          include: {
            client: {
              select: {
                id: true,
                email: true,
                name: true
              }
            }
          }
        }
      }
    });

    // Create an interaction record
    await prisma.interaction.create({
      data: {
        clientId: stage.client.id,
        stageId,
        type: 'Process',
        description: `Added process: ${newProcess.title}`,
        date: new Date(),
      }
    });

    // Handle automated tasks if any
    if (stage.client.email && newProcess.tasks.length > 0) {
      for (const task of newProcess.tasks) {
        switch (task.type) {
          case 'EMAIL':
            await prisma.emailQueue.create({
              data: {
                to: stage.client.email,
                subject: `New Process: ${newProcess.title}`,
                content: `Dear ${stage.client.name},\n\n${newProcess.description}\n\nBest regards,\nYour Agent`,
                status: 'PENDING'
              }
            });
            break;

          case 'DOCUMENT_REQUEST':
            await prisma.documentRequest.create({
              data: {
                clientId: stage.client.id,
                title: newProcess.title,
                description: newProcess.description || '',
                status: 'PENDING',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
              }
            });
            break;

          case 'CALENDAR_INVITE':
            await prisma.meeting.create({
              data: {
                clientId: stage.client.id,
                title: newProcess.title,
                description: newProcess.description || '',
                status: 'PENDING',
                suggestedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
              }
            });
            break;
        }
      }
    }

    return NextResponse.json(newProcess);
  } catch (error) {
    console.error('Error creating process:', error);
    return NextResponse.json(
      { error: 'Failed to create process' },
      { status: 500 }
    );
  }
});

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const urlParts = request.url.split('/');
    const stageId = urlParts[urlParts.indexOf('stages') + 1];

    const processes = await prisma.process.findMany({
      where: { stageId },
      include: {
        tasks: true,
        stage: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(processes);
  } catch (error) {
    console.error('Error fetching processes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch processes' },
      { status: 500 }
    );
  }
}); 