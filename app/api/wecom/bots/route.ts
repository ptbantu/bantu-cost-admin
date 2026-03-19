import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ORG_ID = 'org_bantu_id';

export async function GET() {
  try {
    const bots = await prisma.wecom_bots.findMany({
      where: { organizationId: ORG_ID },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(bots);
  } catch (error) {
    console.error('Failed to fetch bots:', error);
    return NextResponse.json({ error: 'Failed to fetch bots' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, webhookUrl, description, action, id } = await req.json();

    // Test push action
    if (action === 'test') {
      const bot = await prisma.wecom_bots.findUnique({ where: { id } });
      if (!bot) return NextResponse.json({ error: 'Bot not found' }, { status: 404 });

      const res = await fetch(bot.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          msgtype: 'markdown',
          markdown: {
            content: `### 🤖 机器人连接测试成功\n> 来自：**Bantu 管理系统**\n> 机器人：**${bot.name}**\n> 状态：<font color="info">正常</font>\n> 时间：${new Date().toLocaleString('zh-CN')}`,
          },
        }),
      });
      const data = await res.json();
      if (data.errcode !== 0) return NextResponse.json({ error: data.errmsg }, { status: 400 });
      return NextResponse.json({ ok: true });
    }

    const bot = await prisma.wecom_bots.create({
      data: {
        organizationId: ORG_ID,
        name,
        webhookUrl,
        description: description ?? null,
      },
    });
    return NextResponse.json(bot, { status: 201 });
  } catch (error) {
    console.error('Failed to create bot:', error);
    return NextResponse.json({ error: 'Failed to create bot' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, name, webhookUrl, description, isActive } = await req.json();
    const bot = await prisma.wecom_bots.update({
      where: { id },
      data: {
        name,
        webhookUrl,
        description: description ?? null,
        isActive: isActive ?? undefined,
      },
    });
    return NextResponse.json(bot);
  } catch (error) {
    console.error('Failed to update bot:', error);
    return NextResponse.json({ error: 'Failed to update bot' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await prisma.wecom_bots.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to delete bot:', error);
    return NextResponse.json({ error: 'Failed to delete bot' }, { status: 500 });
  }
}
