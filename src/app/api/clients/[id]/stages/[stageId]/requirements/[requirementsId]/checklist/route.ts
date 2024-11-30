import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

// POST /api/clients/requirements/[id]/checklist - Add a checklist item
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const requirementId = request.url.split('/requirements/')[1].split('/checklist')[0];
    const { text } = await request.json();

    const checklistItem = await prisma.requirementChecklist.create({
      data: {
        requirementId,
        text,
        completed: false,
      },
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