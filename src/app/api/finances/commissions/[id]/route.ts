import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';

export const PATCH = withAuth(async (request: NextRequest) => {
  try {
    const id = request.url.split('/commissions/')[1].split('/')[0];
    const data = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Commission ID is required' },
        { status: 400 }
      );
    }

    // Check if commission exists
    const existingCommission = await prisma.commission.findUnique({
      where: { id }
    });

    if (!existingCommission) {
      return NextResponse.json(
        { error: 'Commission not found' },
        { status: 404 }
      );
    }

    // Update commission
    const commission = await prisma.commission.update({
      where: { id },
      data: {
        amount: data.amount ? parseFloat(data.amount.toString()) : undefined,
        percentage: data.percentage ? parseFloat(data.percentage.toString()) : undefined,
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
        }
      }
    });

    // Create an interaction for the update
    await prisma.interaction.create({
      data: {
        clientId: commission.client.id,
        type: 'Commission',
        description: `Commission updated: ${formatCurrency(commission.amount)} for ${commission.propertyTitle}`,
        date: new Date(),
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

export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const id = request.url.split('/commissions/')[1].split('/')[0];

    if (!id) {
      return NextResponse.json(
        { error: 'Commission ID is required' },
        { status: 400 }
      );
    }

    // Get commission details before deletion
    const commission = await prisma.commission.findUnique({
      where: { id },
      include: {
        client: true
      }
    });

    if (!commission) {
      return NextResponse.json(
        { error: 'Commission not found' },
        { status: 404 }
      );
    }

    // Delete the commission
    await prisma.$transaction(async (tx) => {
      // Delete the commission
      await tx.commission.delete({
        where: { id }
      });

      // Create an interaction for the deletion
      await tx.interaction.create({
        data: {
          clientId: commission.clientId,
          type: 'Commission',
          description: `Commission of ${formatCurrency(commission.amount)} for ${commission.propertyTitle} deleted`,
          date: new Date()
        }
      });
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