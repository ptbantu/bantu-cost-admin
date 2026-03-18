import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const isDev = process.env.NODE_ENV === 'development';
const AUTH_BASE = isDev ? '' : 'https://auth.oabantuqifu.com';
const COOKIE_DOMAIN = isDev ? undefined : '.oabantuqifu.com';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes — always allow
  if (
    pathname.startsWith('/api/') ||
    pathname === '/login' ||
    pathname.startsWith('/login')
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, {
              ...options,
              ...(COOKIE_DOMAIN && { domain: COOKIE_DOMAIN }),
              sameSite: 'lax',
              secure: !isDev,
            })
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
    const redirectTarget = siteUrl
      ? `${siteUrl}${pathname}${request.nextUrl.search}`
      : request.nextUrl.href;

    const loginUrl = isDev
      ? new URL('/login', request.url)
      : new URL(`${AUTH_BASE}/login?redirect=${encodeURIComponent(redirectTarget)}`);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
