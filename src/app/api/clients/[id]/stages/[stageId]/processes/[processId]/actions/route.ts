import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const POST = withAuth(async (request: NextRequest) => {
  try {
    // Extract IDs from URL
    const urlParts = request.url.split('/');
    const stageId = urlParts[urlParts.indexOf('stages') + 1];
    const data = await request.json();

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
        type: data.type || 'ACTION',
        status: 'PENDING',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        tasks: {
          create: data.automatedTasks?.map((task: { type: string }) => ({
            type: task.type,
            status: 'PENDING'
          })) || []
        }
      },
      include: {
        tasks: true
      }
    });

    // Create an interaction record
    await prisma.interaction.create({
      data: {
        clientId: stage.client.id,
        stageId,
        type: 'Process',
        description: `Added action: ${newProcess.title}`,
        date: new Date(),
      }
    });

    return NextResponse.json(newProcess);
  } catch (error) {
    console.error('Error creating process action:', error);
    return NextResponse.json(
      { error: 'Failed to create process action' },
      { status: 500 }
    );
  }
}); 