import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js 16 proxy (renamed from `middleware`/`middleware.ts`). Runs on every
 * matched request to:
 *   1. Refresh the Supabase session cookie so Server Components always see a
 *      valid session.
 *   2. Guard protected routes (TICK-007): redirect unauthenticated users to
 *      `/login`, and send already-authenticated users away from `/login`.
 *
 * Runs on the `nodejs` runtime only (proxy can't use edge). Route groups like
 * `(dashboard)` don't appear in `pathname`, so we match on the real segment
 * names (`/dashboard`, `/analytics`, `/settings`, `/onboarding`).
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not add logic between createServerClient and getUser(): this call
  // is what actually refreshes the session token.
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Supabase unreachable — let the request through rather than 500-ing, so a
    // transient outage doesn't lock everyone out.
    return supabaseResponse;
  }

  const { pathname } = request.nextUrl;

  // /reset-password is always public — it handles its own session via the
  // password-recovery code exchange.
  if (pathname.startsWith("/reset-password")) {
    return supabaseResponse;
  }

  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/analytics") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/onboarding");

  const isAuthPage = pathname.startsWith("/login");

  // No valid session on a protected route → send to login, preserving the
  // originally-requested path so the login flow can bounce back to it.
  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // Already signed in but sitting on /login → go straight to the dashboard.
  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.searchParams.delete("redirectTo");
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
