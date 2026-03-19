import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ORG_ID = 'org_bantu_id';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const assigneeId = searchParams.get('assigneeId') || undefined;
  const period = searchParams.get('period') || 'month'; // week | month | quarter

  const now = new Date();
  let periodStart: Date;
  if (period === 'week') {
    periodStart = new Date(now);
    periodStart.setDate(now.getDate() - now.getDay());
    periodStart.setHours(0, 0, 0, 0);
  } else if (period === 'quarter') {
    const q = Math.floor(now.getMonth() / 3);
    periodStart = new Date(now.getFullYear(), q * 3, 1);
  } else {
    periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const leadWhere = {
    organizationId: ORG_ID,
    createdAt: { gte: periodStart },
    ...(assigneeId ? { assigneeId } : {}),
  };

  const oppWhere = {
    organizationId: ORG_ID,
    createdAt: { gte: periodStart },
    ...(assigneeId ? { assigneeId } : {}),
  };

  try {
    const [
      totalLeads,
      convertedLeads,
      wonOpps,
      activeDeliveries,
      leadsByStatus,
      oppsByStatus,
      recentLeads,
      topOpps,
      staffList,
    ] = await Promise.all([
      // 1. Total leads in period
      prisma.leads.count({ where: leadWhere }),

      // 2. Converted leads
      prisma.leads.count({ where: { ...leadWhere, status: 'converted' } }),

      // 3. Won opportunities aggregate
      prisma.opportunities.aggregate({
        where: { ...oppWhere, status: 'won' },
        _sum: { estimatedAmount: true },
        _count: true,
      }),

      // 4. Active deliveries (p7 in_transit)
      prisma.opportunity_p7_data.count({
        where: {
          deliveryStatus: 'in_transit',
          opportunities: {
            organizationId: ORG_ID,
            ...(assigneeId ? { assigneeId } : {}),
          },
        },
      }),

      // 5. Leads breakdown by status
      prisma.leads.groupBy({
        by: ['status'],
        where: leadWhere,
        _count: true,
      }),

      // 6. Opportunities breakdown by status
      prisma.opportunities.groupBy({
        by: ['status'],
        where: oppWhere,
        _count: true,
      }),

      // 7. Recent urgent leads
      prisma.leads.findMany({
        where: {
          organizationId: ORG_ID,
          status: { in: ['new', 'contacted'] },
          urgency: 'HIGH',
          ...(assigneeId ? { assigneeId } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          leadCode: true,
          wechatName: true,
          urgency: true,
          status: true,
          category: true,
          createdAt: true,
          users_auth: { select: { name: true } },
        },
      }),

      // 8. Top active opportunities by amount
      prisma.opportunities.findMany({
        where: {
          organizationId: ORG_ID,
          status: 'active',
          ...(assigneeId ? { assigneeId } : {}),
        },
        orderBy: { estimatedAmount: 'desc' },
        take: 5,
        select: {
          id: true,
          opportunityCode: true,
          estimatedAmount: true,
          currency: true,
          serviceTypeLabel: true,
          stageId: true,
          status: true,
          customers: { select: { customerName: true } },
          users_auth: { select: { name: true } },
        },
      }),

      // 9. Staff list for filter
      prisma.users_auth.findMany({
        where: {
          isActive: true,
          user_organizations: { some: { organizationId: ORG_ID } },
        },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    // Funnel: leads -> contacted -> ready -> converted
    const statusMap = Object.fromEntries(leadsByStatus.map(r => [r.status, r._count]));
    const funnel = [
      { label: '全部线索', value: totalLeads },
      { label: '已联系', value: (statusMap['contacted'] ?? 0) + (statusMap['ready_for_opportunity'] ?? 0) + (statusMap['converted'] ?? 0) },
      { label: '意向商机', value: (statusMap['ready_for_opportunity'] ?? 0) + (statusMap['converted'] ?? 0) },
      { label: '已成交', value: statusMap['converted'] ?? 0 },
    ];

    const oppStatusMap = Object.fromEntries(oppsByStatus.map(r => [r.status, r._count]));

    return NextResponse.json({
      metrics: {
        totalLeads,
        convertedLeads,
        wonAmount: wonOpps._sum.estimatedAmount ?? 0,
        wonCount: wonOpps._count,
        activeDeliveries,
        activeOpps: oppStatusMap['active'] ?? 0,
        lostOpps: oppStatusMap['lost'] ?? 0,
      },
      funnel,
      recentLeads,
      topOpps,
      staffList,
    });
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
