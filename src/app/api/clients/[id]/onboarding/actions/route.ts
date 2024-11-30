import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

// GET /api/clients/[id]/onboarding/actions - Get all onboarding actions
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const id = request.url.split('/clients/')[1].split('/onboarding')[0];

    const actions = await prisma.onboardingAction.findMany({
      where: { clientId: id },
      include: {
        tasks: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json(actions);
  } catch (error) {
    console.error('Error fetching onboarding actions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch onboarding actions' },
      { status: 500 }
    );
  }
});

// POST /api/clients/[id]/onboarding/actions - Create a new onboarding action
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const id = request.url.split('/clients/')[1].split('/onboarding')[0];
    const { action } = await request.json();

    // Create the onboarding action with its tasks
    const newAction = await prisma.onboardingAction.create({
      data: {
        clientId: id,
        title: action.title,
        description: action.description,
        type: action.type,
        status: 'PENDING',
        dueDate: action.dueDate ? new Date(action.dueDate) : null,
        tasks: {
          create: action.automatedTasks.map((task: any) => ({
            type: task.type,
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

    // Process automated tasks
    for (const task of newAction.tasks) {
      switch (task.type) {
        case 'EMAIL':
          if (newAction.client.email) {
            await prisma.emailQueue.create({
              data: {
                to: newAction.client.email,
                subject: `Action Required: ${newAction.title}`,
                content: `Dear ${newAction.client.name},\n\n${newAction.description}\n\nBest regards,\nYour Agent`,
                status: 'PENDING'
              }
            });
          }
          break;

        case 'DOCUMENT_REQUEST':
          await prisma.documentRequest.create({
            data: {
              clientId: id,
              title: newAction.title,
              description: newAction.description,
              status: 'PENDING',
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            }
          });
          break;

        case 'CALENDAR_INVITE':
          await prisma.meeting.create({
            data: {
              clientId: id,
              title: newAction.title,
              description: newAction.description,
              status: 'PENDING',
              suggestedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
            }
          });
          break;
      }
    }

    // Create an interaction record
    await prisma.interaction.create({
      data: {
        clientId: id,
        type: 'Onboarding',
        description: `Added onboarding action: ${newAction.title}`,
        date: new Date(),
      }
    });

    return NextResponse.json(newAction);
  } catch (error) {
    console.error('Error creating onboarding action:', error);
    return NextResponse.json(
      { error: 'Failed to create onboarding action' },
      { status: 500 }
    );
  }
});

// PATCH /api/clients/[id]/onboarding/actions/[actionId] - Update an onboarding action
export const PATCH = withAuth(async (request: NextRequest) => {
  try {
    const urlParts = request.url.split('/');
    const actionId = urlParts[urlParts.length - 1];
    const { status, notes } = await request.json();

    const action = await prisma.onboardingAction.update({
      where: { id: actionId },
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

    // If action is completed, send notification email
    if (status === 'COMPLETED' && action.client.email) {
      await prisma.emailQueue.create({
        data: {
          to: action.client.email,
          subject: `${action.title} Completed`,
          content: `Dear ${action.client.name},\n\nThe action "${action.title}" has been completed.\n\nBest regards,\nYour Agent`,
          status: 'PENDING'
        }
      });
    }

    return NextResponse.json(action);
  } catch (error) {
    console.error('Error updating onboarding action:', error);
    return NextResponse.json(
      { error: 'Failed to update onboarding action' },
      { status: 500 }
    );
  }
}); 