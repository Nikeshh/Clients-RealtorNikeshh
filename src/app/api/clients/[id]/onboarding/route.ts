import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/app/api/email/route';

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const id = request.url.split('/clients/')[1].split('/onboarding')[0];
    const { actions } = await request.json();

    if (!actions || !Array.isArray(actions)) {
      return NextResponse.json(
        { error: 'Actions array is required' },
        { status: 400 }
      );
    }

    // Get client details for email notifications
    const client = await prisma.client.findUnique({
      where: { id },
      select: {
        name: true,
        email: true,
      }
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Create checklist items for each action
    const checklistItems = await Promise.all(
      actions.map(async (action) => {
        const item = await prisma.onboardingAction.create({
          data: {
            clientId: id,
            title: action.title,
            description: action.description,
            type: action.type,
            status: 'PENDING',
            tasks: {
              create: action.automatedTasks.map((task: any) => ({
                type: task.type,
                status: 'PENDING'
              }))
            }
          }
        });

        // Handle automated tasks for each action
        if (action.automatedTasks?.length > 0) {
          await Promise.all(action.automatedTasks.map(async (task: any) => {
            switch (task.type) {
              case 'EMAIL':
                if (client.email) {
                  await prisma.emailQueue.create({
                    data: {
                      to: client.email,
                      subject: `${action.title} - Action Required`,
                      content: `Dear ${client.name},\n\n${action.description}\n\nBest regards,\nYour Agent`,
                      status: 'PENDING'
                    }
                  });
                }
                break;

              case 'DOCUMENT_REQUEST':
                await prisma.documentRequest.create({
                  data: {
                    clientId: id,
                    title: action.title,
                    description: action.description,
                    status: 'PENDING',
                    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                  }
                });
                break;

              case 'CALENDAR_INVITE':
                await prisma.meeting.create({
                  data: {
                    clientId: id,
                    title: action.title,
                    description: action.description,
                    status: 'PENDING',
                    suggestedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
                  }
                });
                break;
            }
          }));
        }

        return item;
      })
    );

    // Create an interaction record for onboarding initiation
    await prisma.interaction.create({
      data: {
        clientId: id,
        type: 'Onboarding',
        description: 'Onboarding process initiated',
        date: new Date(),
        notes: `Initiated ${actions.length} onboarding actions`,
      }
    });

    return NextResponse.json({
      success: true,
      actions: checklistItems
    });
  } catch (error) {
    console.error('Error initiating onboarding:', error);
    return NextResponse.json(
      { error: 'Failed to initiate onboarding process' },
      { status: 500 }
    );
  }
});

// GET endpoint to check onboarding status
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const id = request.url.split('/clients/')[1].split('/onboarding')[0];

    const actions = await prisma.onboardingAction.findMany({
      where: { clientId: id },
      include: {
        tasks: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const documentRequests = await prisma.documentRequest.findMany({
      where: { clientId: id },
      orderBy: { createdAt: 'desc' },
    });

    const meetings = await prisma.meeting.findMany({
      where: { clientId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      actions,
      documentRequests,
      meetings,
      progress: {
        total: actions.length,
        completed: actions.filter(action => action.status === 'COMPLETED').length,
      }
    });
  } catch (error) {
    console.error('Error fetching onboarding status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch onboarding status' },
      { status: 500 }
    );
  }
}); 