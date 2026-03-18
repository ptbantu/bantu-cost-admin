import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ORG_ID = 'org_bantu_id';

export async function GET() {
  try {
    const users = await prisma.users_auth.findMany({
      include: {
        user_organizations: {
          where: { organizationId: ORG_ID },
          include: { roles: true },
        },
        department: { select: { id: true, name: true } },
      },
      orderBy: { name: 'asc' },
    });

    const roles = await prisma.roles.findMany({ orderBy: { name: 'asc' } });

    return NextResponse.json({ users, roles });
  } catch (error) {
    console.error('Failed to fetch staff:', error);
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, email, roleId, departmentId, wecomUserId } = await req.json();

    const user = await prisma.users_auth.create({
      data: {
        id: `user_${Date.now()}`,
        email,
        name,
        wecomUserId: wecomUserId ?? null,
        departmentId: departmentId ?? null,
        updatedAt: new Date(),
      },
    });

    await prisma.user_organizations.create({
      data: {
        userId: user.id,
        organizationId: ORG_ID,
        roleId,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Failed to create staff:', error);
    return NextResponse.json({ error: 'Failed to create staff' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId, isActive, roleId } = await req.json();

    // Update active status
    await prisma.users_auth.update({
      where: { id: userId },
      data: { isActive },
    });

    // Update role if provided
    if (roleId !== undefined) {
      const existing = await prisma.user_organizations.findUnique({
        where: { userId_organizationId: { userId, organizationId: ORG_ID } },
      });
      if (existing) {
        await prisma.user_organizations.update({
          where: { userId_organizationId: { userId, organizationId: ORG_ID } },
          data: { roleId, updatedAt: new Date() },
        });
      } else {
        await prisma.user_organizations.create({
          data: { userId, organizationId: ORG_ID, roleId, updatedAt: new Date() },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to update staff:', error);
    return NextResponse.json({ error: 'Failed to update staff' }, { status: 500 });
  }
}
