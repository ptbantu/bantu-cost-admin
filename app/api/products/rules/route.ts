import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/products/rules?productId=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      const products = await prisma.product.findMany({
        select: { id: true, productCode: true, name: true, category: true, difficulty: true, isExpertMode: true, expertTag: true },
        orderBy: { productCode: 'asc' },
      });
      return NextResponse.json(products);
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true, productCode: true, name: true, category: true,
        difficulty: true, isExpertMode: true, expertTag: true, sla: true,
        materials: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    console.error('GET /api/products/rules error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

// PUT /api/products/rules
export async function PUT(request: Request) {
  try {
    const { productId, difficulty, isExpertMode, expertTag, materials } = await request.json();

    // 更新产品基本规则字段
    await prisma.product.update({
      where: { id: productId },
      data: { difficulty, isExpertMode, expertTag },
    });

    // 删除旧材料规则，重新写入
    await prisma.materialItem.deleteMany({ where: { productId } });

    if (materials?.length > 0) {
      await prisma.materialItem.createMany({
        data: materials.map((m: { name: string; nameId?: string; isRequired: boolean; docType: string; description?: string; sortOrder: number }, i: number) => ({
          productId,
          name: m.name,
          nameId: m.nameId ?? null,
          isRequired: m.isRequired,
          docType: m.docType,
          description: m.description ?? null,
          sortOrder: i,
        })),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
