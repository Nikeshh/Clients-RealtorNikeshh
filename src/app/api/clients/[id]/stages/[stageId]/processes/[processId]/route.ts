import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const urlParts = request.url.split('/');
    const processId = urlParts[urlParts.length - 1];
    const stageId = urlParts[urlParts.indexOf('stages') + 1];

    // Get process details before deletion
    const process = await prisma.process.findFirst({
      where: { 
        id: processId,
        stageId 
      },
      include: {
        stage: {
          include: {
            client: {
              select: {
                id: true
              }
            }
          }
        }
      }
    });

    if (!process) {
      return NextResponse.json(
        { error: 'Process not found' },
        { status: 404 }
      );
    }

    // Delete the process
    await prisma.process.delete({
      where: { id: processId }
    });

    // Create an interaction record
    await prisma.interaction.create({
      data: {
        clientId: process.stage.client.id,
        stageId,
        type: 'Process',
        description: `Deleted process: ${process.title}`,
        date: new Date(),
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting process:', error);
    return NextResponse.json(
      { error: 'Failed to delete process' },
      { status: 500 }
    );
  }
}); 