import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withErrorHandler } from '@/lib/middleware/error';
import type { Interaction } from '@/types/client';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/clients/[id]/interactions - Get all interactions for a client
export const GET = withErrorHandler(async (request: Request, { params }: RouteParams) => {
  const interactions = await prisma.interaction.findMany({
    where: {
      clientId: params.id
    },
    orderBy: {
      date: 'desc'
    }
  });

  return NextResponse.json(interactions);
});

// POST /api/clients/[id]/interactions - Add a new interaction
export const POST = withErrorHandler(async (request: Request, { params }: RouteParams) => {
  const body = await request.json();
  
  // Create the interaction
  const interaction = await prisma.interaction.create({
    data: {
      type: body.type,
      description: body.description,
      notes: body.notes || null,
      date: new Date(body.date),
      clientId: params.id
    }
  });

  // Update client's lastContact
  await prisma.client.update({
    where: {
      id: params.id
    },
    data: {
      lastContact: new Date()
    }
  });

  return NextResponse.json(interaction);
});

// DELETE /api/clients/[id]/interactions/[interactionId] - Delete an interaction
export const DELETE = withErrorHandler(async (request: Request, { params }: RouteParams) => {
  const url = new URL(request.url);
  const interactionId = url.searchParams.get('interactionId');

  if (!interactionId) {
    return NextResponse.json(
      { error: 'Interaction ID is required' },
      { status: 400 }
    );
  }

  await prisma.interaction.delete({
    where: {
      id: interactionId,
      clientId: params.id // Ensure the interaction belongs to this client
    }
  });

  return new NextResponse(null, { status: 204 });
}); 