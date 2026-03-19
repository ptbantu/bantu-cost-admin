import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ORG_ID = 'org_bantu_id';

export async function GET(req: Request) {
  try {
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

    const [total, rows, batches, summary] = await Promise.all([
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
          uploader: { select: { name: true } },
        },
      }),
      prisma.import_batches.findMany({
        where: { organizationId: ORG_ID },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true, bankName: true, currency: true, fileName: true,
          rowCount: true, createdAt: true,
          uploader: { select: { name: true } },
        },
      }),
      prisma.bank_transactions.groupBy({
        by: ['type'],
        where: { organizationId: ORG_ID, ...(bankName ? { bankName } : {}) },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const incomeRow = summary.find(r => r.type === 'INCOME');
    const expenseRow = summary.find(r => r.type === 'EXPENSE');
    const totalIncome = incomeRow?._sum.amount ?? 0;
    const totalExpense = expenseRow?._sum.amount ?? 0;

    return NextResponse.json({
      total, rows, batches, page, pageSize,
      summary: {
        totalIncome,
        totalExpense,
        netFlow: totalIncome - totalExpense,
        incomeCount: incomeRow?._count ?? 0,
        expenseCount: expenseRow?._count ?? 0,
      },
    });
  } catch (error) {
    console.error('Reconciliation GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { batchId } = await req.json();
  await prisma.bank_transactions.deleteMany({ where: { importBatchId: batchId, organizationId: ORG_ID } });
  await prisma.import_batches.delete({ where: { id: batchId } });
  return NextResponse.json({ ok: true });
}
