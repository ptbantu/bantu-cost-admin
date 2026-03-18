import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        prices: {
          orderBy: { effectiveDate: 'desc' },
          take: 2,
        },
      },
      orderBy: { category: 'asc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { productId, costPriceIdr, costPriceCny, partnerPriceIdr, partnerPriceCny, retailPriceIdr, retailPriceCny } = await request.json();

    // 将旧的 isCurrent 设为 false
    await prisma.productPrice.updateMany({
      where: { productId, isCurrent: true },
      data: { isCurrent: false, expiryDate: new Date() },
    });

    // 创建新价格记录
    const newPrice = await prisma.productPrice.create({
      data: {
        productId,
        costPriceIdr,
        costPriceCny,
        partnerPriceIdr,
        partnerPriceCny,
        retailPriceIdr,
        retailPriceCny,
        isCurrent: true,
        effectiveDate: new Date(),
      },
    });

    return NextResponse.json(newPrice);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
