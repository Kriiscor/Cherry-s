import type { NextConfig } from "next";

// TICK-016: OWASP-baseline security headers.
// script-src/style-src allow 'unsafe-inline' because Next.js's App Router
// embeds a small hydration/data script and shadcn/Tailwind sometimes emits
// inline styles; a nonce-based strict CSP would remove this but needs
// per-request nonce plumbing through the proxy, which hasn't been verified
// against Turbopack's dev output — the residual XSS risk here is covered by
// DOMPurify sanitization on all AI-generated markdown (see TICK-006/010) and
// React's own JSX escaping. Tighten to nonces later if this ships publicly.
// React/Turbopack's dev-mode debugging (callstack reconstruction, HMR) calls
// eval() — a real 'Content-Security-Policy' header blocks it and breaks
// `pnpm dev` (confirmed by testing in-browser). 'unsafe-eval' is dev-only.
const isDev = process.env.NODE_ENV !== "production";

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co",
  "font-src 'self' data:",
  `connect-src 'self' https://*.supabase.co https://api.replicate.com${isDev ? " ws:" : ""}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
