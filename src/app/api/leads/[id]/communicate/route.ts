import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const leadId = request.url.split('/leads/')[1].split('/')[0];
    const { type, content } = await request.json();

    // Create an interaction record
    const interaction = await prisma.interaction.create({
      data: {
        type,
        description: content,
        date: new Date(),
        lead: {
          connect: {
            id: leadId
          }
        }
      },
    });

    // If it's an email, you might want to actually send it
    if (type === 'EMAIL') {
      // Add your email sending logic here
    }

    // Update the lead's last contact date
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        lastContact: new Date(),
      },
    });

    return NextResponse.json(interaction);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to record communication' },
      { status: 500 }
    );
  }
}); 