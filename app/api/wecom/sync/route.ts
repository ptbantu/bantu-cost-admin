import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ORG_ID = 'org_bantu_id';
const DEFAULT_ROLE_CODE = 'staff';

const MOCK_DEPARTMENTS = [
  { wecomDeptId: 1, name: 'Bantu 集团', parentWecomDeptId: null, sortOrder: 0 },
  { wecomDeptId: 2, name: '销售中心', parentWecomDeptId: 1, sortOrder: 1 },
  { wecomDeptId: 3, name: '交付中心', parentWecomDeptId: 1, sortOrder: 2 },
  { wecomDeptId: 4, name: '签证交付组', parentWecomDeptId: 3, sortOrder: 1 },
  { wecomDeptId: 5, name: '法务注册组', parentWecomDeptId: 3, sortOrder: 2 },
  { wecomDeptId: 6, name: '财税服务组', parentWecomDeptId: 3, sortOrder: 3 },
  { wecomDeptId: 7, name: '财务部', parentWecomDeptId: 1, sortOrder: 3 },
  { wecomDeptId: 8, name: '技术部', parentWecomDeptId: 1, sortOrder: 4 },
];

const MOCK_USERS = [
  { wecomUserId: 'wecom_alice', name: 'Alice Wang', email: 'alice@bantuqifu.com', wecomDeptId: 3 },
  { wecomUserId: 'wecom_bob', name: 'Bob Chen', email: 'bob@bantuqifu.com', wecomDeptId: 4 },
  { wecomUserId: 'wecom_diana', name: 'Diana Peng', email: 'diana@bantuqifu.com', wecomDeptId: 6 },
];

export async function POST() {
  try {
    // Pass 1: upsert all depts with parentId null
    for (const d of MOCK_DEPARTMENTS) {
      await prisma.departments.upsert({
        where: { organizationId_wecomDeptId: { organizationId: ORG_ID, wecomDeptId: d.wecomDeptId } },
        create: {
          organizationId: ORG_ID,
          name: d.name,
          wecomDeptId: d.wecomDeptId,
          sortOrder: d.sortOrder,
          parentId: null,
        },
        update: { name: d.name, sortOrder: d.sortOrder },
      });
    }

    // Pass 2: resolve parentId
    for (const d of MOCK_DEPARTMENTS) {
      if (d.parentWecomDeptId === null) continue;
      const parent = await prisma.departments.findUnique({
        where: { organizationId_wecomDeptId: { organizationId: ORG_ID, wecomDeptId: d.parentWecomDeptId } },
      });
      if (!parent) continue;
      await prisma.departments.update({
        where: { organizationId_wecomDeptId: { organizationId: ORG_ID, wecomDeptId: d.wecomDeptId } },
        data: { parentId: parent.id },
      });
    }

    // Ensure default role exists
    let defaultRole = await prisma.roles.findUnique({ where: { code: DEFAULT_ROLE_CODE } });
    if (!defaultRole) {
      defaultRole = await prisma.roles.create({
        data: { id: `role_${DEFAULT_ROLE_CODE}`, code: DEFAULT_ROLE_CODE, name: '员工' },
      });
    }

    // Upsert users
    for (const u of MOCK_USERS) {
      const dept = await prisma.departments.findUnique({
        where: { organizationId_wecomDeptId: { organizationId: ORG_ID, wecomDeptId: u.wecomDeptId } },
      });

      const user = await prisma.users_auth.upsert({
        where: { wecomUserId: u.wecomUserId },
        create: {
          id: `user_${u.wecomUserId}`,
          email: u.email,
          name: u.name,
          wecomUserId: u.wecomUserId,
          departmentId: dept?.id ?? null,
          updatedAt: new Date(),
        },
        update: {
          name: u.name,
          departmentId: dept?.id ?? null,
          updatedAt: new Date(),
        },
      });

      // Ensure user_organizations row
      await prisma.user_organizations.upsert({
        where: { userId_organizationId: { userId: user.id, organizationId: ORG_ID } },
        create: {
          userId: user.id,
          organizationId: ORG_ID,
          roleId: defaultRole.id,
          updatedAt: new Date(),
        },
        update: {},
      });
    }

    return NextResponse.json({ synced: { departments: MOCK_DEPARTMENTS.length, users: MOCK_USERS.length } });
  } catch (error) {
    console.error('WeCom sync failed:', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
