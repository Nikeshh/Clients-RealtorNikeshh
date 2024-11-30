import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const urlParts = request.url.split('/');
    const stageId = urlParts[urlParts.indexOf('stages') + 1];
    const { text } = await request.json();

    const checklistItem = await prisma.stageChecklist.create({
      data: {
        stageId,
        text,
        completed: false,
      }
    });

    return NextResponse.json(checklistItem);
  } catch (error) {
    console.error('Error creating checklist item:', error);
    return NextResponse.json(
      { error: 'Failed to create checklist item' },
      { status: 500 }
    );
  }
});

export const PATCH = withAuth(async (request: NextRequest) => {
  try {
    const urlParts = request.url.split('/');
    const itemId = urlParts[urlParts.length - 1];
    const { completed } = await request.json();

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