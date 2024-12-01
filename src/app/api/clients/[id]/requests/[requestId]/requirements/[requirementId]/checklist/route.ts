import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const requirementId = request.url.split('/requirements/')[1].split('/')[0];
    const { text } = await request.json();

    const checklistItem = await prisma.requirementChecklist.create({
      data: {
        requirementId,
        text,
        completed: false,
      },
    });

    await prisma.interaction.create({
      data: {
        clientId: request.url.split('/clients/')[1].split('/')[0],
        type: 'CHECKLIST_ITEM_ADDED',
        description: `Added checklist item to requirement: ${text}`,
        requestId: request.url.split('/requests/')[1].split('/')[0],
        requirementId,
      },
    });

    return NextResponse.json(checklistItem);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to create checklist item' },
      { status: 500 }
    );
  }
});

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const requirementId = request.url.split('/requirements/')[1].split('/')[0];

    const checklist = await prisma.requirementChecklist.findMany({
      where: { requirementId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(checklist);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch checklist' },
      { status: 500 }
    );
  }
});

export const PATCH = withAuth(async (request: NextRequest) => {
  try {
    const requirementId = request.url.split('/requirements/')[1].split('/')[0];
    const { itemId, completed } = await request.json();

    const checklistItem = await prisma.requirementChecklist.update({
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
    const requirementId = request.url.split('/requirements/')[1].split('/')[0];
    const { itemId } = await request.json();

    await prisma.requirementChecklist.delete({
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