import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const leadId = request.url.split('/leads/')[1].split('/')[0];

    // Get the lead
    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    });

    if (!lead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Create a new client from the lead
    const client = await prisma.client.create({
      data: {
        name: `${lead.firstName} ${lead.lastName}`,
        email: lead.email || '',
        phone: lead.phone || '',
        status: 'ACTIVE',
        source: lead.source || 'OTHER',
        notes: lead.notes || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Update the lead as converted
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: 'CONVERTED',
        convertedAt: new Date(),
        convertedClientId: client.id,
      },
    });

    return NextResponse.json({ 
      success: true, 
      client,
      lead: updatedLead 
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to convert lead' },
      { status: 500 }
    );
  }
}); 