import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const PATCH = withAuth(async (request: NextRequest) => {
  try {
    const urlParts = request.url.split('/');
    const stageId = urlParts[urlParts.indexOf('stages') + 1];
    const clientId = urlParts[urlParts.indexOf('clients') + 1];
    const { status, notes } = await request.json();

    // Validate the stage exists and belongs to the client
    const existingStage = await prisma.stage.findFirst({
      where: {
        id: stageId,
        clientId
      }
    });

    if (!existingStage) {
      return NextResponse.json(
        { error: 'Stage not found' },
        { status: 404 }
      );
    }

    // Update the stage
    const stage = await prisma.stage.update({
      where: { id: stageId },
      data: {
        status,
        endDate: status === 'COMPLETED' ? new Date() : null,
      },
      include: {
        checklist: true,
        requirements: true,
        documents: true,
        processes: true
      }
    });

    // Create an interaction record
    await prisma.interaction.create({
      data: {
        clientId,
        stageId,
        type: 'Stage',
        description: `Stage "${stage.title}" marked as ${status}`,
        date: new Date(),
        notes: notes || undefined
      }
    });

    return NextResponse.json(stage);
  } catch (error) {
    console.error('Error updating stage:', error);
    return NextResponse.json(
      { error: 'Failed to update stage' },
      { status: 500 }
    );
  }
}); 