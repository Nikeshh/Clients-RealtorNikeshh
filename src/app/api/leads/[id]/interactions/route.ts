import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const leadId = request.url.split('/leads/')[1].split('/')[0];

    const interactions = await prisma.leadInteraction.findMany({
      where: {
        leadId: leadId
      },
      orderBy: {
        date: 'desc'
      }
    });

    return NextResponse.json(interactions);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interactions' },
      { status: 500 }
    );
  }
}); 