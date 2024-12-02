import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const leadId = request.url.split('/leads/')[1].split('/')[0];

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get the lead
      const lead = await tx.lead.findUnique({
        where: { id: leadId }
      });

      if (!lead) {
        throw new Error('Lead not found');
      }

      // Create a new client
      const client = await tx.client.create({
        data: {
          name: `${lead.firstName} ${lead.lastName}`,
          email: lead.email || `${lead.firstName.toLowerCase()}.${lead.lastName.toLowerCase()}@placeholder.com`,
          phone: lead.phone || 'No phone provided',
          status: 'Active',
          notes: lead.notes || undefined,
        }
      });

      // Update lead status
      await tx.lead.update({
        where: { id: leadId },
        data: {
          status: 'CONVERTED',
          convertedAt: new Date(),
          convertedClientId: client.id
        }
      });

      return client;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to convert lead' },
      { status: 500 }
    );
  }
}); 