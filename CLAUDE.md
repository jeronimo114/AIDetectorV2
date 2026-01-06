# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server at localhost:3000
npm run build    # Build for production
npm run lint     # Run ESLint
```

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_N8N_WEBHOOK_URL` - n8n webhook endpoint for AI detection analysis
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (for admin operations)

## Architecture

**Next.js 14 App Router** application with Supabase for auth and data storage.

### Supabase Client Pattern
Three client factories in `lib/supabase/`:
- `client.ts` - Browser client (singleton, uses anon key)
- `server.ts` - Server Component client (uses cookies, cannot set them)
- `admin.ts` - Service role client (bypasses RLS, for admin operations)

### Middleware (`middleware.ts`)
Handles auth session refresh and route protection:
- Redirects unauthenticated users from `/dashboard` and `/admin` to `/login`
- Restricts `/admin` to users with `admin` or `super_admin` role
- Redirects suspended users to `/suspended`
- Enforces maintenance mode from `app_settings` table

### Key Data Flow
1. User submits text on main page
2. Frontend POSTs to `NEXT_PUBLIC_N8N_WEBHOOK_URL`
3. n8n webhook returns analysis: `{ verdict, confidence, breakdown, signals, model }`
4. Results stored in `analysis_runs` table (for authenticated users)

### Database Tables
- `profiles` - User profiles with `role` and `status` fields
- `analysis_runs` - Detection results with verdict, confidence, signals
- `app_settings` - Key-value settings (e.g., maintenance_mode)
- `audit_logs` - Admin action logging

### Admin Features (`/admin`)
Located in `app/admin/` with supporting code in `lib/admin/` and `components/admin/`:
- User management (roles, suspension)
- Run history viewing
- Audit logs
- App settings (maintenance mode)

### Comparison Logic (`lib/analysis/compare.ts`)
Utilities for comparing analysis results between runs:
- `buildComparison()` - Main function comparing two analyses
- Compares verdict changes, confidence deltas, signal differences, and text modifications
