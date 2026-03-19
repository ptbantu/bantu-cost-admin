import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadToOss } from '@/lib/oss';

const ORG_ID = 'org_bantu_id';

// Parse BCA IDR CSV format
// Columns: Date, Description, Amount (with DB/CR suffix), Balance
function parseBcaCsv(text: string): Array<{
  transactionDate: Date; description: string; amount: number;
  type: 'INCOME' | 'EXPENSE'; balance: number | null; reference: string | null; rawText: string;
}> {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const results = [];
  const currentYear = new Date().getFullYear();

  for (const line of lines) {
    // Skip header lines
    if (line.startsWith('Date') || line.startsWith('Account') || line.startsWith('Period')) continue;
    const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    if (cols.length < 3) continue;

    // Date: "02/02" or "02/02/2024"
    const dateParts = cols[0].split('/');
    if (dateParts.length < 2) continue;
    const month = parseInt(dateParts[0]);
    const day = parseInt(dateParts[1]);
    const year = dateParts[2] ? parseInt(dateParts[2]) : currentYear;
    if (isNaN(month) || isNaN(day)) continue;
    const transactionDate = new Date(year, month - 1, day);

    const description = cols[1] || '';
    // Amount column: "15,000,000.00 DB" or "15,000,000.00 CR"
    const amountRaw = cols[2] || '';
    const isExpense = amountRaw.toUpperCase().includes('DB');
    const amountStr = amountRaw.replace(/[^0-9.]/g, '');
    const amount = parseFloat(amountStr);
    if (isNaN(amount)) continue;

    const balanceRaw = cols[3] || '';
    const balanceStr = balanceRaw.replace(/[^0-9.]/g, '');
    const balance = balanceStr ? parseFloat(balanceStr) : null;

    results.push({
      transactionDate,
      description,
      amount,
      type: isExpense ? 'EXPENSE' : 'INCOME' as 'INCOME' | 'EXPENSE',
      balance,
      reference: cols[4] || null,
      rawText: line,
    });
  }
  return results;
}

// Parse ICBC CNY CSV format
// Columns: Date, Description/摘要, Amount, Direction(借/贷), Balance
function parseIcbcCsv(text: string): Array<{
  transactionDate: Date; description: string; amount: number;
  type: 'INCOME' | 'EXPENSE'; balance: number | null; reference: string | null; rawText: string;
}> {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const results = [];

  for (const line of lines) {
    if (line.startsWith('日期') || line.startsWith('交易日') || line.startsWith('序号')) continue;
    const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    if (cols.length < 3) continue;

    // Date: "2023-02-02" or "2023 02-02"
    const dateStr = cols[0].replace(/\s+/, '-').replace(/(\d{4})\s*(\d{2})-(\d{2})/, '$1-$2-$3');
    const transactionDate = new Date(dateStr);
    if (isNaN(transactionDate.getTime())) continue;

    const description = cols[1] || '';
    const amountStr = (cols[2] || '').replace(/[^0-9.]/g, '');
    const amount = parseFloat(amountStr);
    if (isNaN(amount)) continue;

    // Direction: col[3] = "贷" (credit/income) or "借" (debit/expense)
    const direction = cols[3] || '';
    const isExpense = direction.includes('借') || direction.toLowerCase().includes('db');

    const balanceStr = (cols[4] || '').replace(/[^0-9.]/g, '');
    const balance = balanceStr ? parseFloat(balanceStr) : null;

    results.push({
      transactionDate,
      description,
      amount,
      type: isExpense ? 'EXPENSE' : 'INCOME' as 'INCOME' | 'EXPENSE',
      balance,
      reference: cols[5] || null,
      rawText: line,
    });
  }
  return results;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const bankName = formData.get('bankName') as string;
    const currency = formData.get('currency') as string;
    const accountName = formData.get('accountName') as string | null;
    const accountNumber = formData.get('accountNumber') as string | null;

    if (!file || !bankName || !currency) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const text = buffer.toString('utf-8');

    // Upload raw file to OSS
    const fileUrl = await uploadToOss(buffer, file.name, file.type || 'text/csv');

    // Parse based on bank
    const parsed = currency === 'CNY' ? parseIcbcCsv(text) : parseBcaCsv(text);
    if (parsed.length === 0) {
      return NextResponse.json({ error: 'No valid rows parsed from file' }, { status: 400 });
    }

    // Create batch + transactions in a transaction
    const batch = await prisma.$transaction(async (tx) => {
      const b = await tx.import_batches.create({
        data: {
          organizationId: ORG_ID,
          bankName,
          currency,
          fileName: file.name,
          fileUrl,
          rowCount: parsed.length,
        },
      });

      await tx.bank_transactions.createMany({
        data: parsed.map(r => ({
          organizationId: ORG_ID,
          bankName,
          currency,
          accountName: accountName || null,
          accountNumber: accountNumber || null,
          transactionDate: r.transactionDate,
          description: r.description,
          amount: r.amount,
          type: r.type,
          balance: r.balance,
          reference: r.reference,
          rawText: r.rawText,
          importBatchId: b.id,
        })),
      });

      return b;
    });

    return NextResponse.json({ ok: true, batchId: batch.id, rowCount: parsed.length }, { status: 201 });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Import failed' }, { status: 500 });
  }
}
