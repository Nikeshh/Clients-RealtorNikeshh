import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const PATCH = withAuth(async (request: NextRequest) => {
  try {
    const id = request.url.split('/transactions/')[1].split('/')[0];
    const data = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    // Check if transaction exists
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id }
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Update transaction
    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        type: data.type,
        amount: data.amount ? parseFloat(data.amount.toString()) : undefined,
        description: data.description,
        category: data.category,
        date: data.date ? new Date(data.date) : undefined,
        notes: data.notes,
        clientId: data.clientId || null,
        propertyTitle: data.propertyTitle || 'N/A',
        gatheredPropertyId: data.gatheredPropertyId || null
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

    // Create an interaction if client is associated
    if (transaction.clientId) {
      await prisma.interaction.create({
        data: {
          clientId: transaction.clientId,
          type: 'Financial',
          description: `Transaction updated: ${transaction.description}`,
          date: new Date(),
        }
      });
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const id = request.url.split('/transactions/')[1].split('/')[0];

    if (!id) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    // Get transaction details before deletion
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        client: true
      }
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Delete the transaction
    await prisma.transaction.delete({
      where: { id }
    });

    // Create an interaction if client was associated
    if (transaction.clientId) {
      await prisma.interaction.create({
        data: {
          clientId: transaction.clientId,
          type: 'Financial',
          description: `Transaction deleted: ${transaction.description}`,
          date: new Date(),
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}); 