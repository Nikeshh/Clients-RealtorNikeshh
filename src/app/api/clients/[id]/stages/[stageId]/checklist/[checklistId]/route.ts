import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const PATCH = withAuth(async (request: NextRequest) => {
  try {
    const urlParts = request.url.split('/');
    const itemId = urlParts[urlParts.length - 1];
    const { completed } = await request.json();

    // Validate that the checklist item exists
    const existingItem = await prisma.stageChecklist.findUnique({
      where: { id: itemId }
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Checklist item not found' },
        { status: 404 }
      );
    }

    const checklistItem = await prisma.stageChecklist.update({
      where: { id: itemId },
      data: { completed }
    });

    return NextResponse.json(checklistItem);
  } catch (error) {
    console.error('Error updating checklist item:', error);
    return NextResponse.json(
      { error: 'Failed to update checklist item' },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const urlParts = request.url.split('/');
    const itemId = urlParts[urlParts.length - 1];

    // Validate that the checklist item exists
    const existingItem = await prisma.stageChecklist.findUnique({
      where: { id: itemId }
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Checklist item not found' },
        { status: 404 }
      );
    }

    await prisma.stageChecklist.delete({
      where: { id: itemId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting checklist item:', error);
    return NextResponse.json(
      { error: 'Failed to delete checklist item' },
      { status: 500 }
    );
  }
}); 