import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const GET = withAuth(async (req: NextRequest) => {
  try {
    // Get counts
    const clientCount = await prisma.client.count();
    const propertyCount = await prisma.property.count();
    
    // Get interactions in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const interactionCount = await prisma.interaction.count({
      where: {
        date: {
          gte: thirtyDaysAgo
        }
      }
    });

    // Get recent clients
    const recentClients = await prisma.client.findMany({
      take: 5,
      orderBy: {
        lastContact: 'desc'
      },
      select: {
        id: true,
        name: true,
        status: true,
        lastContact: true
      }
    });

    // Get recent properties
    const recentProperties = await prisma.property.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        status: true,
        price: true
      }
    });

    return NextResponse.json({
      clientCount,
      propertyCount,
      interactionCount,
      recentClients,
      recentProperties
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}); 