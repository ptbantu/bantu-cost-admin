# 新项目接入 oabantuqifu.com 统一登录

## 1. 安装依赖

```bash
npm install @supabase/supabase-js @supabase/ssr
```

## 2. 环境变量 (.env)

```env
NEXT_PUBLIC_SUPABASE_URL=https://uojjjxvlauyjamvoflxb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
NEXT_PUBLIC_SITE_URL=https://your-project.oabantuqifu.com
```

## 3. Supabase Client

**lib/supabase/client.ts**
```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        domain: '.oabantuqifu.com',
        sameSite: 'lax',
        secure: true,
      },
    }
  )
}
```

**lib/supabase/server.ts**
```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, { ...options, domain: '.oabantuqifu.com' })
            )
          } catch {}
        },
      },
    }
  )
}
```

## 4. Middleware

**middleware.ts**
```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const isDev = process.env.NODE_ENV === 'development'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/api/')) return NextResponse.next()

  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, {
              ...options,
              ...(!isDev && { domain: '.oabantuqifu.com' }),
              sameSite: 'lax',
              secure: !isDev,
            })
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
    const redirectTarget = siteUrl
      ? `${siteUrl}${pathname}${request.nextUrl.search}`
      : request.nextUrl.href

    const loginUrl = isDev
      ? new URL('/login', request.url)
      : `https://auth.oabantuqifu.com/login?redirect=${encodeURIComponent(redirectTarget)}`

    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

## 5. Supabase Dashboard 配置

Authentication → URL Configuration → Redirect URLs 添加：
```
https://your-project.oabantuqifu.com/**
```

## 已接入项目

| 项目 | 域名 | NEXT_PUBLIC_SITE_URL |
|------|------|----------------------|
| 后台管理 | admin.oabantuqifu.com | https://admin.oabantuqifu.com |
| 销售中心 | sales.oabantuqifu.com | https://sales.oabantuqifu.com |
| 签证助手 | visa.oabantuqifu.com | https://visa.oabantuqifu.com |
| 登录页 | auth.oabantuqifu.com | — |
