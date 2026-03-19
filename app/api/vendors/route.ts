import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ORG_ID = 'org_bantu_id';

export async function GET() {
  try {
    const vendors = await prisma.vendors.findMany({
      where: { organizationId: ORG_ID },
      include: {
        _count: { select: { expense_items: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Compute totalPaid per vendor from expense_items
    const vendorIds = vendors.map(v => v.id);
    const paid = await prisma.expense_items.groupBy({
      by: ['vendorId'],
      where: { vendorId: { in: vendorIds }, paymentStatus: 'PAID' },
      _sum: { amount: true },
    });
    const paidMap = Object.fromEntries(paid.map(p => [p.vendorId!, p._sum.amount ?? 0]));

    const result = vendors.map(v => ({
      ...v,
      totalPaid: paidMap[v.id] ?? 0,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch vendors:', error);
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { vendorName, category, contactName, phone, email, wechat, bankName, bankAccount, accountHolder, taxId, notes } = body;

    // Generate vendor code
    const count = await prisma.vendors.count({ where: { organizationId: ORG_ID } });
    const vendorCode = `VEND-${String(count + 1).padStart(3, '0')}`;

    const vendor = await prisma.vendors.create({
      data: {
        organizationId: ORG_ID,
        vendorCode,
        vendorName,
        category: category ?? null,
        contactName: contactName ?? null,
        phone: phone ?? null,
        email: email ?? null,
        wechat: wechat ?? null,
        bankName: bankName ?? null,
        bankAccount: bankAccount ?? null,
        accountHolder: accountHolder ?? null,
        taxId: taxId ?? null,
        notes: notes ?? null,
      },
    });

    return NextResponse.json(vendor, { status: 201 });
  } catch (error) {
    console.error('Failed to create vendor:', error);
    return NextResponse.json({ error: 'Failed to create vendor' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, vendorName, category, contactName, phone, email, wechat, bankName, bankAccount, accountHolder, taxId, notes, status } = body;

    const vendor = await prisma.vendors.update({
      where: { id },
      data: {
        vendorName,
        category: category ?? null,
        contactName: contactName ?? null,
        phone: phone ?? null,
        email: email ?? null,
        wechat: wechat ?? null,
        bankName: bankName ?? null,
        bankAccount: bankAccount ?? null,
        accountHolder: accountHolder ?? null,
        taxId: taxId ?? null,
        notes: notes ?? null,
        status: status ?? undefined,
      },
    });

    return NextResponse.json(vendor);
  } catch (error) {
    console.error('Failed to update vendor:', error);
    return NextResponse.json({ error: 'Failed to update vendor' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await prisma.vendors.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to delete vendor:', error);
    return NextResponse.json({ error: 'Failed to delete vendor' }, { status: 500 });
  }
}
