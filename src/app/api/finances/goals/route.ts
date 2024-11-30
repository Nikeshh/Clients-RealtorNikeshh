import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

// GET /api/finances/goals - Get all goals
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const goals = await prisma.financialGoal.findMany({
      orderBy: {
        endDate: 'asc'
      }
    });
    
    return NextResponse.json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
      { status: 500 }
    );
  }
});

// POST /api/finances/goals - Create a new goal
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.title || !data.targetAmount || !data.endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const goal = await prisma.financialGoal.create({
      data: {
        title: data.title,
        targetAmount: parseFloat(data.targetAmount),
        currentAmount: parseFloat(data.currentAmount) || 0,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        notes: data.notes,
        achieved: false,
      }
    });

    return NextResponse.json(goal);
  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json(
      { error: 'Failed to create goal' },
      { status: 500 }
    );
  }
});

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