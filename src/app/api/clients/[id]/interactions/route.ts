import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

// POST /api/clients/[id]/interactions - Add a new interaction
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const body = await request.json();
    
    // Create the interaction
    const interaction = await prisma.interaction.create({
      data: {
        type: body.type,
        description: body.description,
        notes: body.notes,
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
  } catch (error) {
    console.error('Error creating interaction:', error);
    return NextResponse.json(
      { error: 'Error creating interaction' },
      { status: 500 }
    );
  }
} 