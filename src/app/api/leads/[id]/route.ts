import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const PATCH = withAuth(async (request: NextRequest) => {
  try {
    const leadId = request.url.split('/leads/')[1].split('/')[0];
    const data = await request.json();

    const lead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        source: data.source,
        status: data.status,
        notes: data.notes,
      }
    });

    return NextResponse.json(lead);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const leadId = request.url.split('/leads/')[1].split('/')[0];

    await prisma.lead.delete({
      where: { id: leadId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete lead' },
      { status: 500 }
    );
  }
}); 