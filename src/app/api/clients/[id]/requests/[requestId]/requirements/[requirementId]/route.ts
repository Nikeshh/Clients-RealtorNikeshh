import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const requirementId = request.url.split('/requirements/')[1].split('/')[0];

    const requirement = await prisma.clientRequirement.findUnique({
      where: { id: requirementId },
      include: {
        gatheredProperties: true,
        rentalPreferences: true,
        purchasePreferences: true,
        checklist: true,
      },
    });

    if (!requirement) {
      return NextResponse.json(
        { error: 'Requirement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(requirement);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requirement' },
      { status: 500 }
    );
  }
});

export const PATCH = withAuth(async (request: NextRequest) => {
  try {
    const clientId = request.url.split('/clients/')[1].split('/')[0];
    const requestId = request.url.split('/requests/')[1].split('/')[0];
    const requirementId = request.url.split('/requirements/')[1].split('/')[0];
    const updates = await request.json();

    const requirement = await prisma.clientRequirement.update({
      where: { id: requirementId },
      data: {
        ...updates,
        budgetMin: updates.budgetMin ? parseFloat(updates.budgetMin) : undefined,
        budgetMax: updates.budgetMax ? parseFloat(updates.budgetMax) : undefined,
        bedrooms: updates.bedrooms ? parseInt(updates.bedrooms) : undefined,
        bathrooms: updates.bathrooms ? parseInt(updates.bathrooms) : undefined,
      },
      include: {
        gatheredProperties: true,
        rentalPreferences: true,
        purchasePreferences: true,
        checklist: true,
      },
    });

    // Create an interaction for the update
    await prisma.interaction.create({
      data: {
        clientId,
        type: 'REQUIREMENT_UPDATED',
        description: `Requirement "${requirement.name}" updated`,
        requestId,
        requirementId,
      },
    });

    return NextResponse.json(requirement);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to update requirement' },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const clientId = request.url.split('/clients/')[1].split('/')[0];
    const requestId = request.url.split('/requests/')[1].split('/')[0];
    const requirementId = request.url.split('/requirements/')[1].split('/')[0];

    // Create an interaction before deleting
    await prisma.interaction.create({
      data: {
        clientId,
        type: 'REQUIREMENT_DELETED',
        description: 'Requirement deleted',
        requestId,
        requirementId,
      },
    });

    // Delete the requirement (cascade will handle related records)
    await prisma.clientRequirement.delete({
      where: { id: requirementId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete requirement' },
      { status: 500 }
    );
  }
}); 