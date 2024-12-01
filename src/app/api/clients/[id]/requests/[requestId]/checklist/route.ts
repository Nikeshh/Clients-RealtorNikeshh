import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const requestId = request.url.split('/requests/')[1].split('/')[0];
    const { text } = await request.json();

    const checklistItem = await prisma.requestChecklist.create({
      data: {
        requestId,
        text,
        completed: false,
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
    const requestId = request.url.split('/requests/')[1].split('/')[0];

    const checklist = await prisma.requestChecklist.findMany({
      where: { requestId },
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