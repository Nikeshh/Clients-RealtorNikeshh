import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const PATCH = withAuth(async (request: NextRequest) => {
  try {
    const processId = request.url.split('/processes/')[1].split('/')[0];
    const { status, title, description, dueDate } = await request.json();

    const process = await prisma.process.update({
      where: { id: processId },
      data: {
        ...(status && { status }),
        ...(title && { title }),
        ...(description && { description }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(status === 'COMPLETED' ? { completedAt: new Date() } : {}),
      },
      include: {
        tasks: true,
      },
    });

    // Create an interaction for status change
    if (status) {
      await prisma.interaction.create({
        data: {
          clientId: request.url.split('/clients/')[1].split('/')[0],
          type: 'PROCESS_STATUS_CHANGED',
          description: `Process "${process.title}" status changed to ${status}`,
          requestId: request.url.split('/requests/')[1].split('/')[0],
        },
      });
    }

    return NextResponse.json(process);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to update process' },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const processId = request.url.split('/processes/')[1].split('/')[0];

    await prisma.process.delete({
      where: { id: processId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete process' },
      { status: 500 }
    );
  }
}); 