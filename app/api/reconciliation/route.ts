import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ORG_ID = 'org_bantu_id';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const bankName = searchParams.get('bankName') || undefined;
  const type = searchParams.get('type') || undefined;
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = 50;

  const where = {
    organizationId: ORG_ID,
    ...(bankName ? { bankName } : {}),
    ...(type ? { type: type as 'INCOME' | 'EXPENSE' } : {}),
  };

  const [total, rows, batches] = await Promise.all([
    prisma.bank_transactions.count({ where }),
    prisma.bank_transactions.findMany({
      where,
      orderBy: { transactionDate: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true, bankName: true, currency: true, accountName: true,
        transactionDate: true, description: true, amount: true,
        type: true, balance: true, reference: true, importBatchId: true,
      },
    }),
    prisma.import_batches.findMany({
      where: { organizationId: ORG_ID },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { id: true, bankName: true, currency: true, fileName: true, rowCount: true, createdAt: true },
    }),
  ]);

  return NextResponse.json({ total, rows, batches, page, pageSize });
}

export async function DELETE(req: Request) {
  const { batchId } = await req.json();
  await prisma.bank_transactions.deleteMany({ where: { importBatchId: batchId, organizationId: ORG_ID } });
  await prisma.import_batches.delete({ where: { id: batchId } });
  return NextResponse.json({ ok: true });
}
