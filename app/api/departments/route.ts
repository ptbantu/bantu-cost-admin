import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ORG_ID = 'org_bantu_id';

export async function GET() {
  try {
    const depts = await prisma.departments.findMany({
      where: { organizationId: ORG_ID, isActive: true },
      select: {
        id: true,
        name: true,
        parentId: true,
        wecomDeptId: true,
        sortOrder: true,
        _count: { select: { users: true } },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    // compute level by walking parentId map
    const idToParent = new Map(depts.map(d => [d.id, d.parentId]));
    const getLevel = (id: string): number => {
      const parent = idToParent.get(id);
      return parent ? 1 + getLevel(parent) : 0;
    };

    const result = depts.map(d => ({
      id: d.id,
      name: d.name,
      parentId: d.parentId,
      wecomDeptId: d.wecomDeptId,
      sortOrder: d.sortOrder,
      level: getLevel(d.id),
      count: d._count.users,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch departments:', error);
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, parentId, wecomDeptId, sortOrder } = await req.json();

    const dept = await prisma.departments.create({
      data: {
        organizationId: ORG_ID,
        name,
        parentId: parentId ?? null,
        wecomDeptId: wecomDeptId ?? null,
        sortOrder: sortOrder ?? 0,
      },
    });

    return NextResponse.json(dept, { status: 201 });
  } catch (error) {
    console.error('Failed to create department:', error);
    return NextResponse.json({ error: 'Failed to create department' }, { status: 500 });
  }
}
