# ADR-001: Selection of Tech Stack (Next.js / React + shadcn/ui + Supabase)

## Status

Accepted

## Date

2026-09-28

## Context

We are building a responsive web application (PWA / Mobile-first) for tracking meals, calculating calories and macronutrients via AI vision, and generating daily/weekly health reports.
The application needs to be accessible on mobile devices (iOS/Android) and desktop, feature a clean modern UI system with `shadcn/ui`, and provide reliable data persistence and authentication.

## Options Considered

### Option A: Next.js + Tailwind CSS + shadcn/ui + Supabase (Chosen)
- **Pros**: 
  - Standardized modern component architecture via `shadcn/ui` (built on Radix UI and Tailwind CSS).
  - Excellent PWA / mobile-first responsive UX out of the box.
  - Server-side rendering (SSR) and API routes for secure integration with third-party APIs (Replicate).
  - Built-in PostgreSQL, Auth, Realtime, and Row Level Security via Supabase.
- **Cons**: 
  - Requires web hosting (e.g. Vercel) and internet connection for real-time AI processing.

### Option B: React Native / Expo + Supabase
- **Pros**: Pure native app experience.
- **Cons**: Requires separate component libraries, Apple Developer publishing setup for App Store distribution, slower initial web deployment.

## Decision

We choose **Next.js + Tailwind CSS + shadcn/ui + Supabase** because:
1. `shadcn/ui` provides accessible, customizable, beautiful UI primitives designed for desktop and mobile viewports.
2. Next.js API Routes provide a secure serverless backend to proxy Replicate AI requests without exposing API keys to the client.
3. Can easily be converted into a PWA (Progressive Web App) or wrapped with Capacitor later if native App Store distribution is required.

## Consequences

- All client-side UI components will adhere to `shadcn/ui` patterns and accessibility standards.
- Database access will be secured via Supabase Row Level Security (RLS).
- Third-party AI requests will pass exclusively through Next.js server endpoints.
