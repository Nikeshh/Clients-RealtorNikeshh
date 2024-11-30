import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const PATCH = withAuth(async (request: NextRequest) => {
  try {
    const id = request.url.split('/clients/')[1].split('/onboarding')[0];
    const { actionId, status, notes } = await request.json();

    // Update the onboarding action status
    const action = await prisma.onboardingAction.update({
      where: { id: actionId },
      data: {
        status,
        notes: notes || undefined,
        completedAt: status === 'COMPLETED' ? new Date() : undefined,
      },
      include: {
        tasks: true
      }
    });

    // Create an interaction record for the status update
    await prisma.interaction.create({
      data: {
        clientId: id,
        type: 'Onboarding',
        description: `Onboarding action "${action.title}" marked as ${status}`,
        date: new Date(),
        notes: notes || undefined,
      }
    });

    return NextResponse.json(action);
  } catch (error) {
    console.error('Error updating onboarding status:', error);
    return NextResponse.json(
      { error: 'Failed to update onboarding status' },
      { status: 500 }
    );
  }
}); 