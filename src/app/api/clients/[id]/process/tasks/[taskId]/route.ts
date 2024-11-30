import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const PATCH = withAuth(async (request: NextRequest) => {
  try {
    // Extract client ID and task ID from the URL
    const urlParts = request.url.split('/');
    const taskId = urlParts[urlParts.length - 1];
    const clientId = urlParts[urlParts.indexOf('clients') + 1];

    const { status, notes } = await request.json();

    // Validate the task belongs to the client
    const task = await prisma.processAction.findFirst({
      where: {
        id: taskId,
        clientId: clientId
      }
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Update the task
    const updatedTask = await prisma.processAction.update({
      where: { id: taskId },
      data: {
        status,
        notes: notes || undefined,
        completedAt: status === 'COMPLETED' ? new Date() : undefined,
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

    // If task is completed, send notification email
    if (status === 'COMPLETED' && updatedTask.client.email) {
      await prisma.emailQueue.create({
        data: {
          to: updatedTask.client.email,
          subject: `${updatedTask.title} Completed`,
          content: `Dear ${updatedTask.client.name},\n\nThe task "${updatedTask.title}" has been completed.\n\nBest regards,\nYour Agent`,
          status: 'PENDING'
        }
      });
    }

    // Create an interaction record
    await prisma.interaction.create({
      data: {
        clientId,
        type: 'Process',
        description: `Task "${updatedTask.title}" marked as ${status}`,
        date: new Date(),
        notes: notes || undefined
      }
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}); 