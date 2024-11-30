import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const PATCH = withAuth(async (request: NextRequest) => {
  try {
    // Extract task ID from the URL
    const urlParts = request.url.split('/');
    const taskId = urlParts[urlParts.length - 1];
    const { status, notes } = await request.json();

    // Get the task with stage and client info
    const task = await prisma.process.findUnique({
      where: { id: taskId },
      include: {
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

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Update the task
    const updatedTask = await prisma.process.update({
      where: { id: taskId },
      data: {
        status,
        notes: notes || undefined,
        completedAt: status === 'COMPLETED' ? new Date() : undefined,
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

    // If task is completed, send notification email
    if (status === 'COMPLETED' && updatedTask.stage.client.email) {
      await prisma.emailQueue.create({
        data: {
          to: updatedTask.stage.client.email,
          subject: `${updatedTask.title} Completed`,
          content: `Dear ${updatedTask.stage.client.name},\n\nThe task "${updatedTask.title}" has been completed.\n\nBest regards,\nYour Agent`,
          status: 'PENDING'
        }
      });
    }

    // Create an interaction record with clientId
    await prisma.interaction.create({
      data: {
        clientId: task.stage.client.id, // Add clientId
        stageId: task.stageId,
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