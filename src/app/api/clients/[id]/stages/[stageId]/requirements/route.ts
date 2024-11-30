import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const urlParts = request.url.split('/');
    const stageId = urlParts[urlParts.indexOf('stages') + 1];
    const { name, description, status, type, propertyType, budgetMin, budgetMax, bedrooms, bathrooms, preferredLocations, additionalRequirements } = await request.json();

    // Validate required fields
    if (!name || !type || !propertyType || !budgetMin || !budgetMax) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const requirement = await prisma.clientRequirement.create({
      data: {
        stageId,
        name,
        type,
        propertyType,
        budgetMin: parseFloat(budgetMin),
        budgetMax: parseFloat(budgetMax),
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseInt(bathrooms) : null,
        preferredLocations: preferredLocations || [],
        additionalRequirements,
        status: status || 'PENDING',
      }
    });

    // Create an interaction record
    await prisma.interaction.create({
      data: {
        stageId,
        type: 'Requirement',
        description: `Added requirement: ${name}`,
        date: new Date(),
      }
    });

    return NextResponse.json(requirement);
  } catch (error) {
    console.error('Error creating requirement:', error);
    return NextResponse.json(
      { error: 'Failed to create requirement' },
      { status: 500 }
    );
  }
});

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const urlParts = request.url.split('/');
    const stageId = urlParts[urlParts.indexOf('stages') + 1];

    const requirements = await prisma.clientRequirement.findMany({
      where: { stageId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(requirements);
  } catch (error) {
    console.error('Error fetching requirements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requirements' },
      { status: 500 }
    );
  }
});

export const PATCH = withAuth(async (request: NextRequest) => {
  try {
    const urlParts = request.url.split('/');
    const requirementId = urlParts[urlParts.length - 1];
    const data = await request.json();

    const requirement = await prisma.clientRequirement.update({
      where: { id: requirementId },
      data: {
        name: data.name,
        type: data.type,
        propertyType: data.propertyType,
        budgetMin: data.budgetMin ? parseFloat(data.budgetMin) : undefined,
        budgetMax: data.budgetMax ? parseFloat(data.budgetMax) : undefined,
        bedrooms: data.bedrooms ? parseInt(data.bedrooms) : null,
        bathrooms: data.bathrooms ? parseInt(data.bathrooms) : null,
        preferredLocations: data.preferredLocations,
        additionalRequirements: data.additionalRequirements,
        status: data.status,
      }
    });

    return NextResponse.json(requirement);
  } catch (error) {
    console.error('Error updating requirement:', error);
    return NextResponse.json(
      { error: 'Failed to update requirement' },
      { status: 500 }
    );
  }
}); 