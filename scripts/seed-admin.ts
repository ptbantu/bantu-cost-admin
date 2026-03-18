import { PrismaClient } from '../generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const ORG_ID = 'org_bantu_id';

async function main() {
  // 1. Ensure org exists
  const org = await prisma.organizations.findUnique({ where: { id: ORG_ID } });
  if (!org) {
    console.error('Organization org_bantu_id not found. Aborting.');
    return;
  }

  // 2. Upsert 技术部 department for admin
  const dept = await prisma.departments.upsert({
    where: { organizationId_wecomDeptId: { organizationId: ORG_ID, wecomDeptId: 99 } },
    create: {
      organizationId: ORG_ID,
      name: '管理层',
      wecomDeptId: 99,
      sortOrder: 0,
    },
    update: { name: '管理层' },
  });
  console.log('Dept:', dept.id, dept.name);

  // 3. Ensure default role exists
  let role = await prisma.roles.findUnique({ where: { code: 'admin' } });
  if (!role) {
    role = await prisma.roles.create({
      data: { id: 'role_admin', code: 'admin', name: '管理员' },
    });
  }
  console.log('Role:', role.id, role.name);

  // 4. Upsert admin user
  const user = await prisma.users_auth.upsert({
    where: { email: 'admin@bantuqifu.com' },
    create: {
      id: 'user_admin',
      email: 'admin@bantuqifu.com',
      name: '系统管理员',
      departmentId: dept.id,
      updatedAt: new Date(),
    },
    update: {
      departmentId: dept.id,
      updatedAt: new Date(),
    },
  });
  console.log('User:', user.id, user.name, user.email);

  // 5. Ensure user_organizations row
  await prisma.user_organizations.upsert({
    where: { userId_organizationId: { userId: user.id, organizationId: ORG_ID } },
    create: {
      userId: user.id,
      organizationId: ORG_ID,
      roleId: role.id,
      updatedAt: new Date(),
    },
    update: { roleId: role.id, updatedAt: new Date() },
  });
  console.log('Done — admin linked to org with role', role.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
