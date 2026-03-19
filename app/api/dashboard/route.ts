import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ORG_ID = 'org_bantu_id';

function getPeriodRange(period: string) {
  const now = new Date();
  let start: Date;
  if (period === 'week') {
    start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
  } else if (period === 'quarter') {
    const q = Math.floor(now.getMonth() / 3);
    start = new Date(now.getFullYear(), q * 3, 1);
  } else {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  }
  return start;
}

function getPrevPeriodRange(period: string) {
  const now = new Date();
  let start: Date, end: Date;
  if (period === 'week') {
    end = new Date(now);
    end.setDate(now.getDate() - now.getDay());
    end.setHours(0, 0, 0, 0);
    start = new Date(end);
    start.setDate(end.getDate() - 7);
  } else if (period === 'quarter') {
    const q = Math.floor(now.getMonth() / 3);
    end = new Date(now.getFullYear(), q * 3, 1);
    start = new Date(now.getFullYear(), (q - 1) * 3, 1);
  } else {
    end = new Date(now.getFullYear(), now.getMonth(), 1);
    start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  }
  return { start, end };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const assigneeId = searchParams.get('assigneeId') || undefined;
  const period = searchParams.get('period') || 'month';

  const periodStart = getPeriodRange(period);
  const prev = getPrevPeriodRange(period);

  const baseLeadWhere = {
    organizationId: ORG_ID,
    ...(assigneeId ? { assigneeId } : {}),
  };
  const leadWhere = { ...baseLeadWhere, createdAt: { gte: periodStart } };
  const prevLeadWhere = { ...baseLeadWhere, createdAt: { gte: prev.start, lt: prev.end } };

  const baseOppWhere = {
    organizationId: ORG_ID,
    ...(assigneeId ? { assigneeId } : {}),
  };
  const oppWhere = { ...baseOppWhere, createdAt: { gte: periodStart } };
  const prevOppWhere = { ...baseOppWhere, createdAt: { gte: prev.start, lt: prev.end } };

  try {
    const [
      totalLeads, prevTotalLeads,
      convertedLeads,
      wonOpps, prevWonOpps,
      activeDeliveries,
      deliveryStatusGroups,
      leadsByStatus,
      oppsByStatus,
      recentLeads,
      topOpps,
      staffList,
      departments,
      deliveryDetails,
      // Monthly trend: last 6 months won opps
      monthlyTrend,
      // Avg delivery cycle: p1 created -> p7 completedAt
      avgDeliveryCycle,
    ] = await Promise.all([
      prisma.leads.count({ where: leadWhere }),
      prisma.leads.count({ where: prevLeadWhere }),
      prisma.leads.count({ where: { ...leadWhere, status: 'converted' } }),
      prisma.opportunities.aggregate({ where: { ...oppWhere, status: 'won' }, _sum: { estimatedAmount: true }, _count: true }),
      prisma.opportunities.aggregate({ where: { ...prevOppWhere, status: 'won' }, _sum: { estimatedAmount: true }, _count: true }),
      prisma.opportunity_p7_data.count({
        where: { deliveryStatus: 'in_transit', opportunities: { organizationId: ORG_ID, ...(assigneeId ? { assigneeId } : {}) } },
      }),
      prisma.opportunity_p7_data.groupBy({
        by: ['deliveryStatus'],
        where: { opportunities: { organizationId: ORG_ID, ...(assigneeId ? { assigneeId } : {}) } },
        _count: true,
      }),
      prisma.leads.groupBy({ by: ['status'], where: leadWhere, _count: true }),
      prisma.opportunities.groupBy({ by: ['status'], where: oppWhere, _count: true }),
      prisma.leads.findMany({
        where: { organizationId: ORG_ID, status: { in: ['new', 'contacted'] }, urgency: 'HIGH', ...(assigneeId ? { assigneeId } : {}) },
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: {
          id: true, leadCode: true, wechatName: true, urgency: true,
          status: true, category: true, createdAt: true,
          users_auth: { select: { name: true } },
        },
      }),
      prisma.opportunities.findMany({
        where: { organizationId: ORG_ID, status: 'active', ...(assigneeId ? { assigneeId } : {}) },
        orderBy: { estimatedAmount: 'desc' },
        take: 6,
        select: {
          id: true, opportunityCode: true, estimatedAmount: true, currency: true,
          serviceTypeLabel: true, stageId: true,
          customers: { select: { customerName: true } },
          users_auth: { select: { name: true } },
        },
      }),
      prisma.users_auth.findMany({
        where: { isActive: true, user_organizations: { some: { organizationId: ORG_ID } } },
        select: { id: true, name: true, departmentId: true },
        orderBy: { name: 'asc' },
      }),
      prisma.departments.findMany({
        where: { organizationId: ORG_ID, isActive: true },
        select: { id: true, name: true },
        orderBy: { sortOrder: 'asc' },
      }),
      // Delivery details with progress points
      prisma.opportunity_p7_data.findMany({
        where: { opportunities: { organizationId: ORG_ID, ...(assigneeId ? { assigneeId } : {}) } },
        select: {
          id: true, deliveryStatus: true, deliveredAt: true, completedAt: true,
          opportunities: {
            select: {
              opportunityCode: true, createdAt: true,
              users_auth: { select: { name: true } },
              customers: { select: { customerName: true } },
            },
          },
          progress_points: { select: { id: true, status: true } },
        },
        orderBy: { opportunities: { createdAt: 'desc' } },
        take: 20,
      }),
      // Monthly won amount trend (last 6 months)
      prisma.$queryRaw<{ month: string; amount: number; count: number }[]>`
        SELECT
          TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') as month,
          COALESCE(SUM("estimatedAmount"), 0)::float as amount,
          COUNT(*)::int as count
        FROM opportunities
        WHERE "organizationId" = ${ORG_ID}
          AND status = 'won'
          AND "createdAt" >= NOW() - INTERVAL '6 months'
          ${assigneeId ? prisma.$queryRaw`AND "assigneeId" = ${assigneeId}` : prisma.$queryRaw``}
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month ASC
      `,
      // Avg delivery cycle in days
      prisma.$queryRaw<{ avg_days: number }[]>`
        SELECT AVG(EXTRACT(EPOCH FROM (p7."completedAt" - o."createdAt")) / 86400)::float as avg_days
        FROM opportunity_p7_data p7
        JOIN opportunities o ON o.id = p7."opportunityId"
        WHERE o."organizationId" = ${ORG_ID}
          AND p7."completedAt" IS NOT NULL
          ${assigneeId ? prisma.$queryRaw`AND o."assigneeId" = ${assigneeId}` : prisma.$queryRaw``}
      `,
    ]);

    const statusMap = Object.fromEntries(leadsByStatus.map(r => [r.status, r._count]));
    const oppStatusMap = Object.fromEntries(oppsByStatus.map(r => [r.status, r._count]));
    const deliveryMap = Object.fromEntries(deliveryStatusGroups.map(r => [r.deliveryStatus, r._count]));

    // Funnel (5 levels)
    const activeOppCount = oppStatusMap['active'] ?? 0;
    const wonOppCount = oppStatusMap['won'] ?? 0;
    const p3p4Count = await prisma.opportunities.count({
      where: { ...baseOppWhere, stageId: { in: ['P3', 'P4'] }, status: 'active' },
    });
    const funnel = [
      { label: '潜在客户', value: totalLeads },
      { label: '初步意向', value: (statusMap['contacted'] ?? 0) + (statusMap['ready_for_opportunity'] ?? 0) + (statusMap['converted'] ?? 0) },
      { label: '有效商机', value: activeOppCount + wonOppCount },
      { label: '方案/报价', value: p3p4Count },
      { label: '签约成交', value: wonOppCount },
    ];

    // MoM change helpers
    const mom = (curr: number, prev: number) => prev === 0 ? null : Math.round(((curr - prev) / prev) * 100);

    const prevWonAmount = prevWonOpps._sum.estimatedAmount ?? 0;
    const currWonAmount = wonOpps._sum.estimatedAmount ?? 0;

    return NextResponse.json({
      metrics: {
        totalLeads,
        totalLeadsMom: mom(totalLeads, prevTotalLeads),
        convertedLeads,
        conversionRate: totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0,
        wonAmount: currWonAmount,
        wonAmountMom: mom(currWonAmount, prevWonAmount),
        wonCount: wonOpps._count,
        activeDeliveries,
        avgDeliveryCycle: Math.round(avgDeliveryCycle[0]?.avg_days ?? 0),
        activeOpps: activeOppCount,
        lostOpps: oppStatusMap['lost'] ?? 0,
      },
      funnel,
      deliveryStatus: {
        in_transit: deliveryMap['in_transit'] ?? 0,
        delivered: deliveryMap['delivered'] ?? 0,
        completed: deliveryMap['completed'] ?? 0,
      },
      deliveryDetails,
      monthlyTrend,
      recentLeads,
      topOpps,
      staffList,
      departments,
    });
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
