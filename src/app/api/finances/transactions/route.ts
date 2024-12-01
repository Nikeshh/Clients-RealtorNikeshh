import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    // Get transactions with their relations
    const transactions = await prisma.transaction.findMany({
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
        }
      }
    });

    // Get client's gathered properties if clientId is provided
    let clientProperties: { id: string; title: string; requirementId: string; }[] = [];
    if (clientId) {
      const requirements = await prisma.clientRequirement.findMany({
        where: {
          request: {
            clientId
          }
        },
        select: {
          id: true,
          gatheredProperties: {
            select: {
              id: true,
              title: true
            }
          }
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
      transactions,
      total: transactions.reduce((sum, t) => sum + t.amount, 0),
      clients: await prisma.client.findMany({
        select: {
          id: true,
          name: true,
          email: true
        },
        orderBy: {
          name: 'asc'
        }
      }),
      clientProperties
    });
  } catch (error) {
    console.error('Error:', error);
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
    
    if (!data.amount || !data.type || !data.description || !data.category || !data.date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        type: data.type,
        amount: parseFloat(data.amount),
        description: data.description,
        category: data.category,
        date: new Date(data.date),
        notes: data.notes || null,
        clientId: data.clientId || null,
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

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error:', error);
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