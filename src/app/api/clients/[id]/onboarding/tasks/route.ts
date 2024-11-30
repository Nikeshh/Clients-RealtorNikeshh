import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/app/api/email/route';

// GET /api/clients/[id]/onboarding/tasks - Get all onboarding tasks
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const id = request.url.split('/clients/')[1].split('/onboarding')[0];

    const tasks = await prisma.onboardingAction.findMany({
      where: { clientId: id },
      include: {
        tasks: true,
        client: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching onboarding tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch onboarding tasks' },
      { status: 500 }
    );
  }
});

// POST /api/clients/[id]/onboarding/tasks - Create a new onboarding task
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const id = request.url.split('/clients/')[1].split('/onboarding')[0];
    const { task } = await request.json();

    // Create the onboarding task with its automated tasks
    const newTask = await prisma.onboardingAction.create({
      data: {
        clientId: id,
        title: task.title,
        description: task.description,
        type: task.type,
        status: 'PENDING',
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        tasks: {
          create: task.automatedTasks.map((autoTask: any) => ({
            type: autoTask.type,
            status: 'PENDING'
          }))
        }
      },
      include: {
        tasks: true,
        client: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Process automated tasks
    if (newTask.client.email) {
      for (const autoTask of task.automatedTasks) {
        switch (autoTask.type) {
          case 'EMAIL':
            await prisma.emailQueue.create({
              data: {
                to: newTask.client.email,
                subject: `Action Required: ${newTask.title}`,
                content: `Dear ${newTask.client.name},\n\n${newTask.description}\n\nBest regards,\nYour Agent`,
                status: 'PENDING'
              }
            });
            break;

          case 'DOCUMENT_REQUEST':
            await prisma.documentRequest.create({
              data: {
                clientId: id,
                title: newTask.title,
                description: newTask.description,
                status: 'PENDING',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
              }
            });
            break;

          case 'CALENDAR_INVITE':
            await prisma.meeting.create({
              data: {
                clientId: id,
                title: newTask.title,
                description: newTask.description,
                status: 'PENDING',
                suggestedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
              }
            });
            break;
        }
      }
    }

    // Create an interaction record
    await prisma.interaction.create({
      data: {
        clientId: id,
        type: 'Onboarding',
        description: `Added onboarding task: ${newTask.title}`,
        date: new Date(),
      }
    });

    return NextResponse.json(newTask);
  } catch (error) {
    console.error('Error creating onboarding task:', error);
    return NextResponse.json(
      { error: 'Failed to create onboarding task' },
      { status: 500 }
    );
  }
});

// PATCH /api/clients/[id]/onboarding/tasks/[taskId] - Update a task's status
export const PATCH = withAuth(async (request: NextRequest) => {
  try {
    const urlParts = request.url.split('/');
    const taskId = urlParts[urlParts.length - 1];
    const { status, notes } = await request.json();

    const task = await prisma.onboardingAction.update({
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

    // Send notification email if task is completed
    if (status === 'COMPLETED' && task.client.email) {
      await prisma.emailQueue.create({
        data: {
          to: task.client.email,
          subject: `${task.title} Completed`,
          content: `Dear ${task.client.name},\n\nThe task "${task.title}" has been completed.\n\nBest regards,\nYour Agent`,
          status: 'PENDING'
        }
      });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error updating onboarding task:', error);
    return NextResponse.json(
      { error: 'Failed to update onboarding task' },
      { status: 500 }
    );
  }
}); 