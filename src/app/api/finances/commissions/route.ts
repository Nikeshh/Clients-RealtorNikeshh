import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

// GET /api/finances/commissions - Get all commissions
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');

    // Build where clause based on filters
    const where: any = {};
    
    if (status) where.status = status;
    if (startDate) where.dueDate = { ...where.dueDate, gte: new Date(startDate) };
    if (endDate) where.dueDate = { ...where.dueDate, lte: new Date(endDate) };
    if (minAmount) where.amount = { ...where.amount, gte: parseFloat(minAmount) };
    if (maxAmount) where.amount = { ...where.amount, lte: parseFloat(maxAmount) };

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
        property: {
          select: {
            id: true,
            title: true,
            price: true,
            status: true
          }
        },
        requirement: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        transactions: {
          select: {
            id: true,
            date: true,
            amount: true
          }
        }
      }
    });
    
    return NextResponse.json(commissions);
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
    if (!data.amount || !data.propertyId || !data.clientId || !data.dueDate) {
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
          dueDate: new Date(data.dueDate),
          notes: data.notes,
          propertyId: data.propertyId,
          clientId: data.clientId,
          requirementId: data.requirementId || null,
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          property: {
            select: {
              id: true,
              title: true,
              price: true,
              status: true
            }
          }
        }
      });

      // Create interaction for the client
      await tx.interaction.create({
        data: {
          clientId: data.clientId,
          type: 'Commission',
          description: `Commission of ${data.amount} set for ${newCommission.property.title}`,
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

// PATCH /api/finances/commissions/[id] - Update a commission
export const PATCH = withAuth(async (request: NextRequest) => {
  try {
    const id = request.url.split('/').pop();
    const data = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Commission ID is required' },
        { status: 400 }
      );
    }

    const commission = await prisma.commission.update({
      where: { id },
      data: {
        amount: data.amount ? parseFloat(data.amount) : undefined,
        percentage: data.percentage ? parseFloat(data.percentage) : undefined,
        status: data.status,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        receivedDate: data.receivedDate ? new Date(data.receivedDate) : undefined,
        notes: data.notes,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        property: {
          select: {
            id: true,
            title: true,
            price: true,
            status: true
          }
        }
      }
    });

    return NextResponse.json(commission);
  } catch (error) {
    console.error('Error updating commission:', error);
    return NextResponse.json(
      { error: 'Failed to update commission' },
      { status: 500 }
    );
  }
});

// DELETE /api/finances/commissions/[id] - Delete a commission
export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const id = request.url.split('/').pop();

    if (!id) {
      return NextResponse.json(
        { error: 'Commission ID is required' },
        { status: 400 }
      );
    }

    await prisma.commission.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting commission:', error);
    return NextResponse.json(
      { error: 'Failed to delete commission' },
      { status: 500 }
    );
  }
}); 