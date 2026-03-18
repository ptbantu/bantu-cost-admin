import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();
const ORG_ID = 'org_bantu_id';

async function main() {
  // Check existing user
  const user = await prisma.users_auth.findUnique({
    where: { email: 'admin@bantuqifu.com' },
    include: { user_organizations: { include: { roles: true } }, department: true },
  });
  console.log('User:', JSON.stringify(user, null, 2));

  // Check existing depts
  const depts = await prisma.departments.findMany({ where: { organizationId: ORG_ID } });
  console.log('Departments:', depts.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
