import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

// PATCH /api/finances/goals/[id] - Update a goal
export const PATCH = withAuth(async (request: NextRequest) => {
    try {
      const id = request.url.split('/').pop();
      const data = await request.json();
  
      if (!id) {
        return NextResponse.json(
          { error: 'Goal ID is required' },
          { status: 400 }
        );
      }
  
      // Check if the goal exists
      const existingGoal = await prisma.financialGoal.findUnique({
        where: { id }
      });
  
      if (!existingGoal) {
        return NextResponse.json(
          { error: 'Goal not found' },
          { status: 404 }
        );
      }
  
      // Update the goal
      const goal = await prisma.financialGoal.update({
        where: { id },
        data: {
          title: data.title,
          targetAmount: data.targetAmount ? parseFloat(data.targetAmount) : undefined,
          currentAmount: data.currentAmount ? parseFloat(data.currentAmount) : undefined,
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          endDate: data.endDate ? new Date(data.endDate) : undefined,
          notes: data.notes,
          achieved: data.achieved !== undefined ? data.achieved : undefined,
        }
      });
  
      return NextResponse.json(goal);
    } catch (error) {
      console.error('Error updating goal:', error);
      return NextResponse.json(
        { error: 'Failed to update goal' },
        { status: 500 }
      );
    }
  });
  
  // DELETE /api/finances/goals/[id] - Delete a goal
  export const DELETE = withAuth(async (request: NextRequest) => {
    try {
      const id = request.url.split('/').pop();
  
      if (!id) {
        return NextResponse.json(
          { error: 'Goal ID is required' },
          { status: 400 }
        );
      }
  
      await prisma.financialGoal.delete({
        where: { id }
      });
  
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error deleting goal:', error);
      return NextResponse.json(
        { error: 'Failed to delete goal' },
        { status: 500 }
      );
    }
  }); 