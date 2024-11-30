import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';

// GET /api/finances/transactions - Get all transactions
export const GET = withAuth(async (request: NextRequest) => {
  try {
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');

    // Build where clause based on filters
    const where: any = {};
    
    if (type) where.type = type;
    if (category) where.category = category;
    if (startDate) where.date = { ...where.date, gte: new Date(startDate) };
    if (endDate) where.date = { ...where.date, lte: new Date(endDate) };
    if (minAmount) where.amount = { ...where.amount, gte: parseFloat(minAmount) };
    if (maxAmount) where.amount = { ...where.amount, lte: parseFloat(maxAmount) };

    // Get transactions and total
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: {
          date: 'desc'
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
              address: true
            }
          },
          commission: {
            select: {
              id: true,
              amount: true,
              status: true
            }
          }
        }
      }),
      prisma.transaction.aggregate({
        where,
        _sum: {
          amount: true
        }
      })
    ]);
    
    return NextResponse.json({
      transactions,
      total: total._sum.amount || 0
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
});

// POST /api/finances/transactions - Create a new transaction
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.amount || !data.type || !data.description || !data.category || !data.date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create transaction and update related records
    const transaction = await prisma.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          type: data.type,
          amount: parseFloat(data.amount),
          description: data.description,
          category: data.category,
          date: new Date(data.date),
          notes: data.notes || null,
          clientId: data.clientId || null,
          propertyId: data.propertyId || null,
          commissionId: data.commissionId || null,
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
              address: true
            }
          },
          commission: {
            select: {
              id: true,
              amount: true,
              status: true
            }
          }
        }
      });

      // Update commission status if this is a commission payment
      if (data.commissionId) {
        await tx.commission.update({
          where: { id: data.commissionId },
          data: {
            status: 'RECEIVED',
            receivedDate: new Date()
          }
        });
      }

      // Create interaction if client is associated
      if (data.clientId) {
        await tx.interaction.create({
          data: {
            stageId: data.stageId,
            type: 'Financial',
            description: `${data.type === 'INCOME' ? 'Received' : 'Paid'} ${formatCurrency(parseFloat(data.amount))} - ${data.description}`,
            date: new Date(),
            notes: data.notes
          }
        });
      }

      return newTransaction;
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
});

// PATCH /api/finances/transactions/[id] - Update a transaction
export const PATCH = withAuth(async (request: NextRequest) => {
  try {
    const id = request.url.split('/').pop();
    const data = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        type: data.type,
        amount: data.amount ? parseFloat(data.amount) : undefined,
        description: data.description,
        category: data.category,
        date: data.date ? new Date(data.date) : undefined,
        notes: data.notes,
        clientId: data.clientId,
        propertyId: data.propertyId,
        commissionId: data.commissionId,
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
            address: true
          }
        }
      }
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
});

// DELETE /api/finances/transactions/[id] - Delete a transaction
export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const id = request.url.split('/').pop();

    if (!id) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    await prisma.transaction.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}); 