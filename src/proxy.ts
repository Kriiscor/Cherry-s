import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Renamed from `middleware`/`middleware.ts` in Next.js 16. Refreshes the
 * Supabase session cookie on every request so Server Components always see
 * a valid session. Runs on the `nodejs` runtime only (proxy can't use edge).
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
  await supabase.auth.getUser();

  // TICK-007 (auth) should extend this to redirect unauthenticated users
  // away from protected routes (e.g. `/(dashboard)/*`) once those routes
  // exist. Route groups like `(dashboard)` don't appear in `pathname`, so
  // match on the real segment names.

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
