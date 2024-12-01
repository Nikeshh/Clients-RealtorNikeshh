import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Run all queries in parallel for better performance
    const [
      activeClients,
      totalRequests,
      monthlyTransactions,
      pendingCommissions,
      recentInteractions,
      upcomingMeetings,
      requestsByType,
      clientsByStatus,
      activeProcesses,
    ] = await Promise.all([
      // Active Clients Count
      prisma.client.count({
        where: { status: 'Active' }
      }),

      // Total Active Requests
      prisma.request.count({
        where: { status: 'ACTIVE' }
      }),

      // Monthly Transactions
      prisma.transaction.aggregate({
        where: {
          date: { gte: startOfMonth }
        },
        _sum: {
          amount: true
        },
        _count: true
      }),

      // Pending Commissions
      prisma.commission.aggregate({
        where: {
          status: 'PENDING',
          dueDate: { gte: new Date() }
        },
        _sum: {
          amount: true
        },
        _count: true
      }),

      // Recent Interactions
      prisma.interaction.findMany({
        take: 5,
        orderBy: { date: 'desc' },
        include: {
          client: {
            select: { name: true }
          }
        }
      }),

      // Upcoming Meetings
      prisma.meeting.findMany({
        where: {
          scheduledDate: { gte: new Date() },
          status: 'SCHEDULED'
        },
        take: 5,
        orderBy: { scheduledDate: 'asc' },
        include: {
          client: {
            select: { name: true }
          }
        }
      }),

      // Requests by Type
      prisma.request.groupBy({
        by: ['type'],
        _count: true,
        where: { status: 'ACTIVE' }
      }),

      // Clients by Status
      prisma.client.groupBy({
        by: ['status'],
        _count: true
      }),

      // Active Processes
      prisma.process.findMany({
        where: {
          status: { in: ['PENDING', 'IN_PROGRESS'] }
        },
        take: 5,
        orderBy: { dueDate: 'asc' },
        include: {
          request: {
            include: {
              client: {
                select: { name: true }
              }
            }
          }
        }
      })
    ]);

    return NextResponse.json({
      overview: {
        activeClients,
        totalRequests,
        monthlyRevenue: monthlyTransactions._sum.amount || 0,
        pendingCommissions: pendingCommissions._sum.amount || 0,
        transactionCount: monthlyTransactions._count,
        pendingCommissionCount: pendingCommissions._count
      },
      recentActivity: {
        interactions: recentInteractions,
        upcomingMeetings,
        activeProcesses
      },
      analytics: {
        requestsByType: requestsByType.reduce((acc, curr) => {
          acc[curr.type] = curr._count;
          return acc;
        }, {} as Record<string, number>),
        clientsByStatus: clientsByStatus.reduce((acc, curr) => {
          acc[curr.status] = curr._count;
          return acc;
        }, {} as Record<string, number>)
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}); 