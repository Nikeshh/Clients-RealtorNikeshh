import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const requestId = request.url.split('/requests/')[1].split('/')[0];
    const { title, description, type, dueDate } = await request.json();

    const process = await prisma.process.create({
      data: {
        requestId,
        title,
        description,
        type,
        status: 'PENDING',
        dueDate: dueDate ? new Date(dueDate) : undefined,
      },
      include: {
        tasks: true,
      },
    });

    await prisma.interaction.create({
      data: {
        clientId: request.url.split('/clients/')[1].split('/')[0],
        type: 'PROCESS_CREATED',
        description: `Process "${title}" created`,
        requestId,
      },
    });

    return NextResponse.json(process);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to create process' },
      { status: 500 }
    );
  }
});

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const requestId = request.url.split('/requests/')[1].split('/')[0];

    const processes = await prisma.process.findMany({
      where: { requestId },
      include: {
        tasks: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(processes);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch processes' },
      { status: 500 }
    );
  }
}); 