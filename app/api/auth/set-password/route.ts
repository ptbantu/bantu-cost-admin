import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { userId, password } = await req.json();
    if (!userId || !password || password.length < 6) {
      return NextResponse.json({ error: '密码至少6位' }, { status: 400 });
    }

    const user = await prisma.users_auth.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: '用户不存在' }, { status: 404 });

    // Hash and store in our DB
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.users_auth.update({ where: { id: userId }, data: { passwordHash } });

    // Upsert in Supabase Auth (admin API via service role)
    const supabase = await createClient();
    const { data: existing } = await supabase.auth.admin.listUsers();
    const authUser = existing?.users?.find(u => u.email === user.email);

    if (authUser) {
      await supabase.auth.admin.updateUserById(authUser.id, { password });
    } else {
      await supabase.auth.admin.createUser({
        email: user.email,
        password,
        email_confirm: true,
        user_metadata: { name: user.name },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Set password failed:', error);
    return NextResponse.json({ error: '设置密码失败' }, { status: 500 });
  }
}
