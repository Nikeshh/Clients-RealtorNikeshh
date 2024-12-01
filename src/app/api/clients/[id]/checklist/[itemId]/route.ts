import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const PATCH = withAuth(async (request: NextRequest) => {
  try {
    const itemId = request.url.split('/checklist/')[1].split('/')[0];
    const { completed } = await request.json();

    const checklistItem = await prisma.clientChecklist.update({
      where: { id: itemId },
      data: { completed },
    });

    return NextResponse.json(checklistItem);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to update checklist item' },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const itemId = request.url.split('/checklist/')[1].split('/')[0];

    await prisma.clientChecklist.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete checklist item' },
      { status: 500 }
    );
  }
}); 