import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const AUTH_BASE = 'https://auth.oabantuqifu.com';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes — always allow
  if (pathname.startsWith('/api/')) {
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
              domain: '.oabantuqifu.com',
              sameSite: 'lax',
              secure: true,
            })
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const currentUrl = request.nextUrl.href;
    return NextResponse.redirect(
      `${AUTH_BASE}/login?redirect=${encodeURIComponent(currentUrl)}`
    );
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
