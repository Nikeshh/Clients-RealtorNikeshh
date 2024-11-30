import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const PATCH = withAuth(async (request: NextRequest) => {
  try {
    const urlParts = request.url.split('/');
    const stageId = urlParts[urlParts.indexOf('stages') + 1];
    const processId = urlParts[urlParts.indexOf('processes') + 1];
    const { status, notes } = await request.json();

    // Get the process with stage and client info
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
                id: true,
                email: true,
                name: true
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

    // Update the process
    const updatedProcess = await prisma.process.update({
      where: { id: processId },
      data: {
        status,
        notes: notes || undefined,
        completedAt: status === 'COMPLETED' ? new Date() : null,
      },
      include: {
        tasks: true
      }
    });

    // Create an interaction record
    await prisma.interaction.create({
      data: {
        clientId: process.stage.client.id,
        stageId,
        type: 'Process',
        description: `Process "${process.title}" marked as ${status}`,
        date: new Date(),
        notes: notes || undefined
      }
    });

    return NextResponse.json(updatedProcess);
  } catch (error) {
    console.error('Error updating process status:', error);
    return NextResponse.json(
      { error: 'Failed to update process status' },
      { status: 500 }
    );
  }
}); 