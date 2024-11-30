import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const PATCH = withAuth(async (request: NextRequest) => {
  try {
    const id = request.url.split('/clients/')[1].split('/process')[0];
    const { actionId, status, notes } = await request.json();

    // Update the process action status
    const action = await prisma.processAction.update({
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
        type: 'Process',
        description: `Process action "${action.title}" marked as ${status}`,
        date: new Date(),
        notes: notes || undefined,
      }
    });

    return NextResponse.json(action);
  } catch (error) {
    console.error('Error updating process status:', error);
    return NextResponse.json(
      { error: 'Failed to update process status' },
      { status: 500 }
    );
  }
}); 