import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(leads);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const data = await request.json();
    
    const lead = await prisma.lead.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        source: data.source,
        status: 'NEW',
        notes: data.notes
      }
    });

    return NextResponse.json(lead);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}); 