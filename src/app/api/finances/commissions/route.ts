import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';

// GET /api/finances/commissions - Get all commissions
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');
    const clientId = searchParams.get('clientId');

    // Build where clause based on filters
    const where: any = {};
    
    if (status) where.status = status;
    if (startDate) where.dueDate = { ...where.dueDate, gte: new Date(startDate) };
    if (endDate) where.dueDate = { ...where.dueDate, lte: new Date(endDate) };
    if (minAmount) where.amount = { ...where.amount, gte: parseFloat(minAmount) };
    if (maxAmount) where.amount = { ...where.amount, lte: parseFloat(maxAmount) };

    // Get commissions
    const commissions = await prisma.commission.findMany({
      where,
      orderBy: {
        dueDate: 'asc'
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
      }
    });

    // Get all clients for dropdown
    const clients = await prisma.client.findMany({
      select: {
        id: true,
        name: true,
        email: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Get client's gathered properties if clientId is provided
    let clientProperties: any[] = [];
    if (clientId) {
      const requirements = await prisma.clientRequirement.findMany({
        where: {
          request: {
            clientId
          }
        },
        include: {
          gatheredProperties: true
        }
      });

      clientProperties = requirements.flatMap(req => 
        req.gatheredProperties.map(prop => ({
          id: prop.id,
          title: prop.title,
          requirementId: req.id
        }))
      );
    }
    
    return NextResponse.json({
      commissions,
      clients,
      clientProperties: clientId ? clientProperties : []
    });
  } catch (error) {
    console.error('Error fetching commissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch commissions' },
      { status: 500 }
    );
  }
});

// POST /api/finances/commissions - Create a new commission
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.amount || !data.clientId || !data.propertyTitle || !data.dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create commission and initial transaction
    const commission = await prisma.$transaction(async (tx) => {
      const newCommission = await tx.commission.create({
        data: {
          amount: parseFloat(data.amount),
          percentage: parseFloat(data.percentage),
          status: 'PENDING',
          propertyTitle: data.propertyTitle,
          dueDate: new Date(data.dueDate),
          notes: data.notes,
          clientId: data.clientId,
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      // Create interaction for the client
      await tx.interaction.create({
        data: {
          clientId: data.clientId,
          type: 'Commission',
          description: `Commission of ${data.amount} set for ${data.propertyTitle}`,
          date: new Date(),
          notes: data.notes
        }
      });

      return newCommission;
    });

    return NextResponse.json(commission);
  } catch (error) {
    console.error('Error creating commission:', error);
    return NextResponse.json(
      { error: 'Failed to create commission' },
      { status: 500 }
    );
  }
}); 