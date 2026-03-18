import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id, productCode, name, category, description, sla,
      difficulty, isExpertMode, expertTag,
      costPriceIdr, costPriceCny, partnerPriceIdr, partnerPriceCny,
      retailPriceIdr, retailPriceCny,
    } = body;

    const ORG_ID = 'org_bantu_id';

    if (id) {
      // Update
      const product = await prisma.product.update({
        where: { id },
        data: { name, category, description, sla, difficulty, isExpertMode, expertTag },
      });
      return NextResponse.json(product);
    } else {
      // Create
      const product = await prisma.product.create({
        data: {
          organizationId: ORG_ID,
          productCode,
          name,
          category,
          description,
          sla,
          difficulty,
          isExpertMode,
          expertTag,
          prices: {
            create: {
              costPriceIdr: costPriceIdr ?? 0,
              costPriceCny: costPriceCny ?? 0,
              partnerPriceIdr,
              partnerPriceCny,
              retailPriceIdr: retailPriceIdr ?? 0,
              retailPriceCny,
              isCurrent: true,
            },
          },
        },
      });
      return NextResponse.json(product);
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
