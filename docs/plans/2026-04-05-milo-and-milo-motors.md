# Milo & Milo Motors - Car Auction App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a simple car auction web app where the public can browse used cars, verify their email, and place bids. Two admins (both named Milos) manage listings. Up to 20 cars at a time. No payment processing.

**Architecture:** Next.js App Router serves both the public auction pages and the admin panel. Supabase provides Postgres database, auth (for admin only), and image storage. Resend sends email verification codes to bidders. Vercel hosts everything for free.

**Tech Stack:** Next.js 14 (App Router, TypeScript), Tailwind CSS, Supabase (Postgres + Auth + Storage), Resend (email), Vercel (hosting)

---

## Prerequisites (Manual Steps — Do These Before Starting Code)

These are one-time account setup steps. A developer cannot automate these — they require clicking through web UIs and copying credentials.

### P1: Create a Supabase Project

1. Go to https://supabase.com and sign up / log in
2. Click "New Project"
3. Name it `milo-and-milo-motors`
4. Set a database password (save it somewhere safe — you won't need it in code but can't recover it)
5. Choose the region closest to your users
6. Wait for the project to finish provisioning (~2 minutes)
7. Go to **Settings → API** and copy these values (you'll need them in Task 1):
   - `Project URL` (looks like `https://abcdefg.supabase.co`)
   - `anon` public key (starts with `eyJ...`)
   - `service_role` secret key (starts with `eyJ...`) — **keep this secret, never expose in browser code**

### P2: Create a Resend Account

1. Go to https://resend.com and sign up
2. Go to **API Keys** and create a new key — copy it (starts with `re_`)
3. **Important:** On the free tier without a verified domain, you can only send emails FROM `onboarding@resend.dev` and TO the email you signed up with. This is fine for development/testing.
4. For production (real users): you'll need to verify a domain in Resend. This can be done later — the code will work the same, you just change the `from` address in the env variable.

### P3: Create the Admin User in Supabase

1. In your Supabase dashboard, go to **Authentication → Users**
2. Click "Add User" → "Create New User"
3. Enter the admin email and a strong password
4. This is the login your friend (Milos) will use for the admin panel
5. You can add a second admin user the same way for the other Milos

---

## File Structure

```
milo-and-milo-motors/
├── app/
│   ├── layout.tsx                    # Root layout — metadata, fonts, global wrapper
│   ├── page.tsx                      # Home page — grid of active car auctions
│   ├── globals.css                   # Tailwind CSS imports
│   ├── cars/
│   │   └── [id]/
│   │       └── page.tsx              # Car detail — photos, bids, bid form
│   ├── admin/
│   │   ├── layout.tsx                # Admin layout — auth gate, nav bar
│   │   ├── page.tsx                  # Admin dashboard — list cars, see bids
│   │   ├── login/
│   │   │   └── page.tsx              # Admin login form
│   │   └── cars/
│   │       ├── new/
│   │       │   └── page.tsx          # Add new car form
│   │       └── [id]/
│   │           └── page.tsx          # Edit car form
│   └── api/
│       ├── verify/
│       │   ├── send/route.ts         # POST — send 6-digit code to email
│       │   └── confirm/route.ts      # POST — verify code, return token
│       └── bids/route.ts             # POST — place a bid (requires verified email)
├── components/
│   ├── CountdownTimer.tsx            # Client component — live countdown to auction end
│   ├── BidForm.tsx                   # Client component — email verify + bid placement
│   ├── CarCard.tsx                   # Car card for the home page grid
│   └── ImageUpload.tsx               # Client component — image upload for admin
├── lib/
│   ├── supabase/
│   │   ├── browser.ts                # Supabase client for browser (anon key)
│   │   └── server.ts                 # Supabase client for server/API routes (service role)
│   └── resend.ts                     # Resend client initialization
├── middleware.ts                      # Supabase auth session refresh
├── .env.local.example                # Template for environment variables
├── .gitignore
├── next.config.ts
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Task 1: Project Scaffolding

**Goal:** Create the Next.js project, install all dependencies, configure environment variables, and verify it runs.

**Files:**
- Create: entire project via `create-next-app`
- Create: `.env.local.example`
- Create: `.env.local` (gitignored — actual secrets)
- Modify: `.gitignore`

- [ ] **Step 1: Create the Next.js project**

Run this from the project directory (`/Users/banek1/Projects/milo-and-milo-motors`):

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --turbopack
```

When prompted:
- Would you like to use `src/` directory? **No**
- Would you like to customize the default import alias? **No** (accept `@/*`)

This creates the full Next.js project in the current directory.

- [ ] **Step 2: Install additional dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr resend
```

What each package does:
- `@supabase/supabase-js` — Supabase JavaScript client (database queries, auth, storage)
- `@supabase/ssr` — Supabase helpers for server-side rendering (cookie-based auth sessions in Next.js)
- `resend` — Resend email SDK

- [ ] **Step 3: Create the environment variables template**

Create `.env.local.example`:

```env
# Supabase (get from: Supabase Dashboard → Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key

# Resend (get from: Resend Dashboard → API Keys)
RESEND_API_KEY=re_your-api-key

# Email sender (use onboarding@resend.dev for development, your domain for production)
EMAIL_FROM=Milo & Milo Motors <onboarding@resend.dev>
```

- [ ] **Step 4: Create the actual `.env.local` file**

Copy the template and fill in real values from Prerequisites P1 and P2:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and paste in the actual keys from your Supabase and Resend dashboards.

- [ ] **Step 5: Verify `.gitignore` includes `.env.local`**

Open `.gitignore` and confirm it contains:

```
.env.local
```

Next.js `create-next-app` includes this by default, but double-check. **Never commit `.env.local` — it contains secret keys.**

- [ ] **Step 6: Verify the project runs**

```bash
npm run dev
```

Expected: Server starts on http://localhost:3000 and you see the default Next.js welcome page.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat: scaffold Next.js project with Supabase and Resend deps"
```

---

## Task 2: Database Schema & Storage

**Goal:** Create the database tables in Supabase and set up image storage. This is done in the Supabase SQL Editor (browser), not in code.

**Files:**
- Create: `supabase/schema.sql` (for documentation — we run it in the Supabase dashboard)

- [ ] **Step 1: Create the schema SQL file**

Create `supabase/schema.sql` — this is the single source of truth for the database schema. You will copy-paste this into the Supabase SQL Editor.

```sql
-- ============================================
-- Milo & Milo Motors — Database Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================

-- 1. Cars table
create table public.cars (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  year integer,
  mileage integer,
  starting_price numeric(10,2) not null,
  image_urls text[] default '{}',
  auction_end_time timestamptz not null,
  created_at timestamptz default now()
);

-- 2. Bids table
create table public.bids (
  id uuid default gen_random_uuid() primary key,
  car_id uuid references public.cars(id) on delete cascade not null,
  bidder_name text not null,
  bidder_email text not null,
  amount numeric(10,2) not null,
  created_at timestamptz default now()
);

-- 3. Verification codes table
create table public.verification_codes (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  code text not null,
  expires_at timestamptz not null,
  used boolean default false,
  created_at timestamptz default now()
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS on all tables
alter table public.cars enable row level security;
alter table public.bids enable row level security;
alter table public.verification_codes enable row level security;

-- Cars: anyone can read
create policy "Anyone can view cars"
  on public.cars for select
  using (true);

-- Cars: only authenticated users (admins) can insert/update/delete
create policy "Admins can insert cars"
  on public.cars for insert
  to authenticated
  with check (true);

create policy "Admins can update cars"
  on public.cars for update
  to authenticated
  using (true);

create policy "Admins can delete cars"
  on public.cars for delete
  to authenticated
  using (true);

-- Bids: anyone can read
create policy "Anyone can view bids"
  on public.bids for select
  using (true);

-- Bids: inserted via API route with service_role key (bypasses RLS)
-- No public insert policy needed

-- Verification codes: all access via API routes with service_role key
-- No public policies needed

-- ============================================
-- Indexes for performance
-- ============================================
create index idx_bids_car_id on public.bids(car_id);
create index idx_bids_amount on public.bids(car_id, amount desc);
create index idx_verification_codes_email on public.verification_codes(email, used);
```

- [ ] **Step 2: Run the schema in Supabase**

1. Go to your Supabase dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New query**
4. Paste the entire contents of `supabase/schema.sql`
5. Click **Run**
6. You should see "Success. No rows returned" — this means all tables and policies were created

- [ ] **Step 3: Verify tables exist**

In Supabase dashboard, click **Table Editor** in the left sidebar. You should see three tables:
- `cars` (columns: id, title, description, year, mileage, starting_price, image_urls, auction_end_time, created_at)
- `bids` (columns: id, car_id, bidder_name, bidder_email, amount, created_at)
- `verification_codes` (columns: id, email, code, expires_at, used, created_at)

- [ ] **Step 4: Create the image storage bucket**

1. In Supabase dashboard, click **Storage** in the left sidebar
2. Click **New bucket**
3. Name: `car-images`
4. Check **Public bucket** (so images can be viewed by anyone without auth)
5. Click **Create bucket**

- [ ] **Step 5: Set storage policy for uploads**

1. Click on the `car-images` bucket
2. Click **Policies** tab
3. Click **New Policy** → **For full customization**
4. Policy name: `Admins can upload images`
5. Allowed operation: **INSERT**
6. Target roles: **authenticated**
7. Policy definition (USING expression): `true`
8. Click **Save**

This allows authenticated users (the admin) to upload images. Anyone can view them (public bucket).

- [ ] **Step 6: Commit**

```bash
git add supabase/schema.sql
git commit -m "docs: add database schema SQL for Supabase"
```

---

## Task 3: Supabase Client Setup

**Goal:** Create utility functions for initializing Supabase clients. One for the browser (public, anon key), one for the server (service role, used in API routes), and middleware for auth session refresh.

**Files:**
- Create: `lib/supabase/browser.ts`
- Create: `lib/supabase/server.ts`
- Create: `middleware.ts`

- [ ] **Step 1: Create the browser Supabase client**

Create `lib/supabase/browser.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

This client is used in client components (`'use client'`). It uses the **anon key**, which means it can only do what RLS policies allow (read cars and bids).

- [ ] **Step 2: Create the server Supabase client**

Create `lib/supabase/server.ts`:

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method is called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  )
}

// Admin-only client using service role key — bypasses RLS
// ONLY use in API routes, NEVER expose to the browser
export function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return [] },
        setAll() {},
      },
    }
  )
}
```

**Why two functions?**
- `createClient()` — uses anon key + cookies, respects RLS. Used in server components and admin pages to check auth.
- `createServiceClient()` — uses service_role key, bypasses RLS. Used in API routes to insert bids, manage verification codes.

- [ ] **Step 3: Create the Resend client**

Create `lib/resend.ts`:

```typescript
import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY!)
```

- [ ] **Step 4: Create middleware for auth session refresh**

Create `middleware.ts` in the project root:

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh the auth session
  const { data: { user } } = await supabase.auth.getUser()

  // If trying to access admin pages (not login) without being logged in, redirect
  if (
    !user &&
    request.nextUrl.pathname.startsWith('/admin') &&
    !request.nextUrl.pathname.startsWith('/admin/login')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Run middleware on all routes except static files and images
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

This middleware does two things:
1. Refreshes the Supabase auth session on every request (keeps admin logged in)
2. Redirects unauthenticated users away from `/admin/*` pages to `/admin/login`

- [ ] **Step 5: Verify the project still compiles**

```bash
npm run dev
```

Expected: No compilation errors. The page should still load at http://localhost:3000.

- [ ] **Step 6: Commit**

```bash
git add lib/ middleware.ts
git commit -m "feat: add Supabase client utilities and auth middleware"
```

---

## Task 4: Admin Login Page

**Goal:** Build the admin login page where Milos enters email + password to access the dashboard.

**Files:**
- Create: `app/admin/login/page.tsx`

- [ ] **Step 1: Create the admin login page**

Create `app/admin/login/page.tsx`:

```tsx
'use client'

import { createClient } from '@/lib/supabase/browser'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Invalid email or password')
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold text-center mb-6">Milo & Milo Motors</h1>
        <p className="text-gray-500 text-center mb-6">Admin Login</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Test the login page**

1. Run `npm run dev`
2. Navigate to http://localhost:3000/admin/login
3. You should see the login form
4. Enter the admin credentials you created in Prerequisite P3
5. After login, you'll be redirected to `/admin` (which doesn't exist yet — that's OK, you'll see a 404)
6. If you enter wrong credentials, you should see "Invalid email or password"

- [ ] **Step 3: Commit**

```bash
git add app/admin/login/
git commit -m "feat: add admin login page with Supabase auth"
```

---

## Task 5: Admin Layout & Dashboard

**Goal:** Create the admin layout (nav bar, logout button) and dashboard page showing all cars and their bid counts.

**Files:**
- Create: `app/admin/layout.tsx`
- Create: `app/admin/page.tsx`
- Create: `app/admin/actions.ts`

- [ ] **Step 1: Create admin server actions (logout)**

Create `app/admin/actions.ts`:

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}
```

- [ ] **Step 2: Create the admin layout**

Create `app/admin/layout.tsx`:

```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from './actions'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Double-check auth (middleware also does this, but belt-and-suspenders)
  if (!user) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="/admin" className="text-xl font-bold">Milo & Milo Motors</a>
            <a href="/admin" className="text-gray-600 hover:text-gray-900">Dashboard</a>
            <a href="/admin/cars/new" className="text-gray-600 hover:text-gray-900">Add Car</a>
            <a href="/" className="text-gray-600 hover:text-gray-900" target="_blank">View Site</a>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user.email}</span>
            <form action={signOut}>
              <button type="submit" className="text-sm text-red-600 hover:text-red-800">
                Logout
              </button>
            </form>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
```

Note: the admin login page (`/admin/login`) is NOT wrapped by this layout because the middleware redirects unauthenticated users before this layout renders. The login page has its own self-contained layout (the centered card).

Wait — actually in Next.js App Router, nested layouts always apply. The login page IS inside `/admin/`, so this layout would wrap it too. We need to handle this. The simplest fix: move the login check into a conditional.

**Actually, let's fix this:** The login page is at `/admin/login/page.tsx`. The admin layout at `/admin/layout.tsx` wraps ALL pages under `/admin/`, including login. We have two options:

**Option A:** Move the login page outside of `/admin/` (e.g., `/login/page.tsx`)
**Option B:** Make the layout conditional — don't show nav if not logged in

Let's go with **Option A** — it's cleaner. Move the login page to `/login/page.tsx`.

**Correction — update the admin layout to:**

```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from './actions'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Not logged in — the middleware handles redirects,
  // but if somehow we get here, just render children (login page)
  if (!user) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a href="/admin" className="text-xl font-bold">Milo & Milo Motors</a>
            <a href="/admin" className="text-gray-600 hover:text-gray-900">Dashboard</a>
            <a href="/admin/cars/new" className="text-gray-600 hover:text-gray-900">Add Car</a>
            <a href="/" className="text-gray-600 hover:text-gray-900" target="_blank">View Site</a>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user.email}</span>
            <form action={signOut}>
              <button type="submit" className="text-sm text-red-600 hover:text-red-800">
                Logout
              </button>
            </form>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
```

This way, the login page renders without the nav bar (just `{children}`), and authenticated pages get the full admin shell.

- [ ] **Step 3: Create the admin dashboard page**

Create `app/admin/page.tsx`:

```tsx
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Fetch all cars with their bid counts and highest bids
  const { data: cars } = await supabase
    .from('cars')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch all bids grouped by car
  const { data: bids } = await supabase
    .from('bids')
    .select('car_id, amount')
    .order('amount', { ascending: false })

  // Build a map: car_id -> { count, highest_bid }
  const bidMap: Record<string, { count: number; highest: number }> = {}
  for (const bid of bids || []) {
    if (!bidMap[bid.car_id]) {
      bidMap[bid.car_id] = { count: 0, highest: 0 }
    }
    bidMap[bid.car_id].count++
    if (bid.amount > bidMap[bid.car_id].highest) {
      bidMap[bid.car_id].highest = bid.amount
    }
  }

  const now = new Date()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link
          href="/admin/cars/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + Add Car
        </Link>
      </div>

      {(!cars || cars.length === 0) ? (
        <p className="text-gray-500">No cars listed yet. Add your first car!</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Car</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Starting Price</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Highest Bid</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Bids</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cars.map((car) => {
                const ended = new Date(car.auction_end_time) < now
                const info = bidMap[car.id]
                return (
                  <tr key={car.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{car.title}</div>
                      <div className="text-sm text-gray-500">
                        {car.year} {car.mileage ? `· ${car.mileage.toLocaleString()} mi` : ''}
                      </div>
                    </td>
                    <td className="px-4 py-3">${car.starting_price.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {info ? `$${info.highest.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-4 py-3">{info?.count || 0}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        ended
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {ended ? 'Ended' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/cars/${car.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Test the admin dashboard**

1. Run `npm run dev`
2. Navigate to http://localhost:3000/admin
3. If not logged in, you should be redirected to `/admin/login`
4. After logging in, you should see the dashboard with an empty state message
5. The nav bar should show the admin email and a Logout button

- [ ] **Step 5: Commit**

```bash
git add app/admin/
git commit -m "feat: add admin layout, dashboard, and logout"
```

---

## Task 6: Admin — Add & Edit Cars

**Goal:** Build the forms for admins to add new cars and edit existing ones, including image upload to Supabase Storage.

**Files:**
- Create: `components/ImageUpload.tsx`
- Create: `app/admin/cars/new/page.tsx`
- Create: `app/admin/cars/[id]/page.tsx`

- [ ] **Step 1: Create the image upload component**

Create `components/ImageUpload.tsx`:

```tsx
'use client'

import { createClient } from '@/lib/supabase/browser'
import { useState } from 'react'

interface ImageUploadProps {
  existingUrls: string[]
  onUrlsChange: (urls: string[]) => void
}

export default function ImageUpload({ existingUrls, onUrlsChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const newUrls: string[] = [...existingUrls]

    for (const file of Array.from(files)) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

      const { error } = await supabase.storage
        .from('car-images')
        .upload(fileName, file)

      if (error) {
        console.error('Upload error:', error.message)
        continue
      }

      const { data: { publicUrl } } = supabase.storage
        .from('car-images')
        .getPublicUrl(fileName)

      newUrls.push(publicUrl)
    }

    onUrlsChange(newUrls)
    setUploading(false)
  }

  function removeImage(index: number) {
    const updated = existingUrls.filter((_, i) => i !== index)
    onUrlsChange(updated)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Photos</label>

      {existingUrls.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {existingUrls.map((url, i) => (
            <div key={i} className="relative w-24 h-24">
              <img src={url} alt="" className="w-full h-full object-cover rounded" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white rounded-full text-xs flex items-center justify-center"
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleUpload}
        disabled={uploading}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
    </div>
  )
}
```

- [ ] **Step 2: Create the "Add Car" page**

Create `app/admin/cars/new/page.tsx`:

```tsx
'use client'

import { createClient } from '@/lib/supabase/browser'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import ImageUpload from '@/components/ImageUpload'

export default function NewCarPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = new FormData(e.currentTarget)
    const title = form.get('title') as string
    const description = form.get('description') as string
    const year = parseInt(form.get('year') as string) || null
    const mileage = parseInt(form.get('mileage') as string) || null
    const starting_price = parseFloat(form.get('starting_price') as string)
    const auction_end_time = form.get('auction_end_time') as string

    if (!title || !starting_price || !auction_end_time) {
      setError('Title, starting price, and auction end time are required')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from('cars').insert({
      title,
      description: description || null,
      year,
      mileage,
      starting_price,
      image_urls: imageUrls,
      auction_end_time: new Date(auction_end_time).toISOString(),
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Add New Car</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            placeholder="e.g. 2019 Honda Civic EX"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <input
              id="year"
              name="year"
              type="number"
              placeholder="e.g. 2019"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 mb-1">
              Mileage
            </label>
            <input
              id="mileage"
              name="mileage"
              type="number"
              placeholder="e.g. 45000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Describe the car — condition, features, history..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="starting_price" className="block text-sm font-medium text-gray-700 mb-1">
              Starting Price ($) *
            </label>
            <input
              id="starting_price"
              name="starting_price"
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="e.g. 5000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="auction_end_time" className="block text-sm font-medium text-gray-700 mb-1">
              Auction End Date/Time *
            </label>
            <input
              id="auction_end_time"
              name="auction_end_time"
              type="datetime-local"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <ImageUpload existingUrls={imageUrls} onUrlsChange={setImageUrls} />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Car'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
```

- [ ] **Step 3: Create the "Edit Car" page**

Create `app/admin/cars/[id]/page.tsx`:

```tsx
'use client'

import { createClient } from '@/lib/supabase/browser'
import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import ImageUpload from '@/components/ImageUpload'

interface Car {
  id: string
  title: string
  description: string | null
  year: number | null
  mileage: number | null
  starting_price: number
  image_urls: string[]
  auction_end_time: string
}

interface Bid {
  id: string
  bidder_name: string
  bidder_email: string
  amount: number
  created_at: string
}

export default function EditCarPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const [car, setCar] = useState<Car | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const { data: carData } = await supabase
        .from('cars')
        .select('*')
        .eq('id', params.id)
        .single()

      if (carData) {
        setCar(carData)
        setImageUrls(carData.image_urls || [])
      }

      const { data: bidData } = await supabase
        .from('bids')
        .select('*')
        .eq('car_id', params.id)
        .order('amount', { ascending: false })

      if (bidData) setBids(bidData)
    }
    load()
  }, [params.id, supabase])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = new FormData(e.currentTarget)

    const { error: updateError } = await supabase
      .from('cars')
      .update({
        title: form.get('title') as string,
        description: (form.get('description') as string) || null,
        year: parseInt(form.get('year') as string) || null,
        mileage: parseInt(form.get('mileage') as string) || null,
        starting_price: parseFloat(form.get('starting_price') as string),
        image_urls: imageUrls,
        auction_end_time: new Date(form.get('auction_end_time') as string).toISOString(),
      })
      .eq('id', params.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this car and all its bids?')) return

    await supabase.from('cars').delete().eq('id', params.id)
    router.push('/admin')
    router.refresh()
  }

  if (!car) return <p>Loading...</p>

  // Format datetime-local value from ISO string
  const endTimeLocal = new Date(car.auction_end_time).toISOString().slice(0, 16)

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Edit Car</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={car.title}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <input id="year" name="year" type="number" defaultValue={car.year ?? ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 mb-1">Mileage</label>
            <input id="mileage" name="mileage" type="number" defaultValue={car.mileage ?? ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea id="description" name="description" rows={4} defaultValue={car.description ?? ''}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="starting_price" className="block text-sm font-medium text-gray-700 mb-1">Starting Price ($) *</label>
            <input id="starting_price" name="starting_price" type="number" step="0.01" min="0" required
              defaultValue={car.starting_price}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label htmlFor="auction_end_time" className="block text-sm font-medium text-gray-700 mb-1">Auction End Date/Time *</label>
            <input id="auction_end_time" name="auction_end_time" type="datetime-local" required
              defaultValue={endTimeLocal}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <ImageUpload existingUrls={imageUrls} onUrlsChange={setImageUrls} />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
            Cancel
          </button>
          <button type="button" onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 ml-auto">
            Delete Car
          </button>
        </div>
      </form>

      {/* Bids section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Bids ({bids.length})</h2>
        {bids.length === 0 ? (
          <p className="text-gray-500">No bids yet.</p>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Bidder</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bids.map((bid) => (
                  <tr key={bid.id}>
                    <td className="px-4 py-3">{bid.bidder_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{bid.bidder_email}</td>
                    <td className="px-4 py-3 font-medium">${bid.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(bid.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Test car management**

1. Run `npm run dev`
2. Log in at http://localhost:3000/admin/login
3. Click "Add Car" and fill out the form:
   - Title: "2019 Honda Civic EX"
   - Year: 2019, Mileage: 45000
   - Description: "Well maintained, one owner"
   - Starting price: 5000
   - End time: pick a date a few days in the future
   - Upload 1-2 images
4. Submit — you should be redirected to the dashboard and see the car listed
5. Click "Edit" — the form should be pre-filled with the car's data
6. Change the description and save — verify the change persists
7. Verify images show up in the edit page

- [ ] **Step 5: Commit**

```bash
git add components/ImageUpload.tsx app/admin/cars/
git commit -m "feat: add admin car management (create, edit, delete, image upload)"
```

---

## Task 7: Public Home Page — Car Listings with Countdown Timers

**Goal:** Build the public-facing home page showing a grid of active car auctions, each with a live countdown timer.

**Files:**
- Create: `components/CountdownTimer.tsx`
- Create: `components/CarCard.tsx`
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create the countdown timer component**

Create `components/CountdownTimer.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'

interface CountdownTimerProps {
  endTime: string // ISO date string
}

export default function CountdownTimer({ endTime }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState('')
  const [ended, setEnded] = useState(false)

  useEffect(() => {
    function update() {
      const now = new Date().getTime()
      const end = new Date(endTime).getTime()
      const diff = end - now

      if (diff <= 0) {
        setTimeLeft('Auction Ended')
        setEnded(true)
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`)
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`)
      }
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [endTime])

  return (
    <span className={ended ? 'text-red-600 font-medium' : 'text-orange-600 font-mono font-medium'}>
      {timeLeft}
    </span>
  )
}
```

- [ ] **Step 2: Create the car card component**

Create `components/CarCard.tsx`:

```tsx
import Link from 'next/link'
import CountdownTimer from './CountdownTimer'

interface CarCardProps {
  car: {
    id: string
    title: string
    year: number | null
    mileage: number | null
    starting_price: number
    image_urls: string[]
    auction_end_time: string
  }
  highestBid: number | null
}

export default function CarCard({ car, highestBid }: CarCardProps) {
  const currentPrice = highestBid ?? car.starting_price

  return (
    <Link href={`/cars/${car.id}`} className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden">
      <div className="aspect-[4/3] bg-gray-200 relative">
        {car.image_urls.length > 0 ? (
          <img
            src={car.image_urls[0]}
            alt={car.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Photo
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg">{car.title}</h3>
        <p className="text-sm text-gray-500">
          {car.year ?? ''} {car.mileage ? `· ${car.mileage.toLocaleString()} mi` : ''}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">
              {highestBid ? 'Current Bid' : 'Starting At'}
            </p>
            <p className="text-xl font-bold text-green-700">${currentPrice.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Time Left</p>
            <CountdownTimer endTime={car.auction_end_time} />
          </div>
        </div>
      </div>
    </Link>
  )
}
```

- [ ] **Step 3: Update the root layout**

Replace the contents of `app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Milo & Milo Motors — Used Car Auctions',
  description: 'Bid on quality used cars from Milo & Milo Motors',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

- [ ] **Step 4: Build the home page**

Replace the contents of `app/page.tsx`:

```tsx
import { createClient } from '@/lib/supabase/server'
import CarCard from '@/components/CarCard'
import Link from 'next/link'

export const revalidate = 60 // Revalidate every 60 seconds

export default async function HomePage() {
  const supabase = await createClient()

  const { data: cars } = await supabase
    .from('cars')
    .select('*')
    .order('auction_end_time', { ascending: true })

  const { data: bids } = await supabase
    .from('bids')
    .select('car_id, amount')

  // Build highest bid map
  const highestBidMap: Record<string, number> = {}
  for (const bid of bids || []) {
    if (!highestBidMap[bid.car_id] || bid.amount > highestBidMap[bid.car_id]) {
      highestBidMap[bid.car_id] = bid.amount
    }
  }

  // Separate active and ended auctions
  const now = new Date()
  const activeCars = (cars || []).filter(c => new Date(c.auction_end_time) > now)
  const endedCars = (cars || []).filter(c => new Date(c.auction_end_time) <= now)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Milo & Milo Motors</h1>
          <p className="text-gray-500 mt-1">Quality used cars — bid now!</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeCars.length === 0 && endedCars.length === 0 && (
          <p className="text-gray-500 text-center py-12">
            No cars listed yet. Check back soon!
          </p>
        )}

        {activeCars.length > 0 && (
          <>
            <h2 className="text-xl font-bold mb-4">Active Auctions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {activeCars.map((car) => (
                <CarCard key={car.id} car={car} highestBid={highestBidMap[car.id] ?? null} />
              ))}
            </div>
          </>
        )}

        {endedCars.length > 0 && (
          <>
            <h2 className="text-xl font-bold mb-4 text-gray-400">Ended Auctions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
              {endedCars.map((car) => (
                <CarCard key={car.id} car={car} highestBid={highestBidMap[car.id] ?? null} />
              ))}
            </div>
          </>
        )}
      </main>

      <footer className="border-t bg-white mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-400">
          Milo & Milo Motors
        </div>
      </footer>
    </div>
  )
}
```

- [ ] **Step 5: Test the home page**

1. Run `npm run dev`
2. Navigate to http://localhost:3000
3. If you added a car in Task 6, you should see it displayed in a card with:
   - Photo (or "No Photo" placeholder)
   - Title, year, mileage
   - Starting price
   - Live countdown timer (updating every second)
4. The countdown should show days/hours/minutes/seconds
5. Clicking the card should navigate to `/cars/[id]` (which we'll build next)

- [ ] **Step 6: Commit**

```bash
git add components/CountdownTimer.tsx components/CarCard.tsx app/page.tsx app/layout.tsx
git commit -m "feat: add public home page with car listings and countdown timers"
```

---

## Task 8: Car Detail Page

**Goal:** Build the public car detail page showing full photos, description, bid history, and the bid form placeholder.

**Files:**
- Create: `app/cars/[id]/page.tsx`

- [ ] **Step 1: Create the car detail page**

Create `app/cars/[id]/page.tsx`:

```tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CountdownTimer from '@/components/CountdownTimer'
import BidForm from '@/components/BidForm'

export const revalidate = 30

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CarDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: car } = await supabase
    .from('cars')
    .select('*')
    .eq('id', id)
    .single()

  if (!car) notFound()

  const { data: bids } = await supabase
    .from('bids')
    .select('*')
    .eq('car_id', id)
    .order('amount', { ascending: false })

  const highestBid = bids && bids.length > 0 ? bids[0].amount : null
  const auctionEnded = new Date(car.auction_end_time) < new Date()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <a href="/" className="text-xl font-bold hover:text-blue-600">
            Milo & Milo Motors
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Photos & Description */}
          <div className="lg:col-span-2">
            {/* Photo gallery */}
            {car.image_urls.length > 0 ? (
              <div className="space-y-2">
                <div className="aspect-[16/9] bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={car.image_urls[0]}
                    alt={car.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {car.image_urls.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {car.image_urls.map((url: string, i: number) => (
                      <img
                        key={i}
                        src={url}
                        alt={`${car.title} photo ${i + 1}`}
                        className="w-24 h-24 object-cover rounded flex-shrink-0"
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-[16/9] bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                No Photos
              </div>
            )}

            {/* Car details */}
            <h1 className="text-3xl font-bold mt-6">{car.title}</h1>
            <p className="text-gray-500 mt-1">
              {car.year ?? ''} {car.mileage ? `· ${car.mileage.toLocaleString()} miles` : ''}
            </p>

            {car.description && (
              <div className="mt-4 text-gray-700 whitespace-pre-wrap">{car.description}</div>
            )}

            {/* Bid history */}
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Bid History ({bids?.length || 0})</h2>
              {(!bids || bids.length === 0) ? (
                <p className="text-gray-500">No bids yet. Be the first!</p>
              ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Bidder</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Amount</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {bids.map((bid, i) => (
                        <tr key={bid.id} className={i === 0 ? 'bg-green-50' : ''}>
                          <td className="px-4 py-3">{bid.bidder_name}</td>
                          <td className="px-4 py-3 font-medium">
                            ${bid.amount.toLocaleString()}
                            {i === 0 && <span className="ml-2 text-xs text-green-600 font-medium">HIGHEST</span>}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(bid.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right: Bid Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <div className="mb-4">
                <p className="text-sm text-gray-500">
                  {highestBid ? 'Current High Bid' : 'Starting Price'}
                </p>
                <p className="text-3xl font-bold text-green-700">
                  ${(highestBid ?? car.starting_price).toLocaleString()}
                </p>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-500">Time Left</p>
                <div className="text-xl">
                  <CountdownTimer endTime={car.auction_end_time} />
                </div>
              </div>

              {auctionEnded ? (
                <div className="text-center py-4 bg-gray-100 rounded-md">
                  <p className="font-medium text-gray-600">Auction has ended</p>
                  {highestBid && bids && (
                    <p className="text-sm text-gray-500 mt-1">
                      Won by {bids[0].bidder_name} for ${highestBid.toLocaleString()}
                    </p>
                  )}
                </div>
              ) : (
                <BidForm
                  carId={car.id}
                  minimumBid={highestBid ? highestBid + 1 : car.starting_price}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
```

Note: This page imports `BidForm` which we'll create in Task 9. For now, create a placeholder so the page compiles.

- [ ] **Step 2: Create the BidForm placeholder**

Create `components/BidForm.tsx`:

```tsx
'use client'

interface BidFormProps {
  carId: string
  minimumBid: number
}

export default function BidForm({ carId, minimumBid }: BidFormProps) {
  return (
    <div className="text-center py-4 bg-blue-50 rounded-md">
      <p className="text-sm text-gray-500">Bidding coming in next task</p>
      <p className="text-xs text-gray-400">Min bid: ${minimumBid}</p>
    </div>
  )
}
```

- [ ] **Step 3: Test the car detail page**

1. Run `npm run dev`
2. From the home page, click on a car card
3. You should see:
   - Large photo with thumbnail gallery
   - Car title, year, mileage
   - Description
   - Empty bid history
   - Bid panel on the right with countdown timer
   - Placeholder where the bid form will go
4. The URL should be `/cars/<uuid>`

- [ ] **Step 4: Commit**

```bash
git add app/cars/ components/BidForm.tsx
git commit -m "feat: add car detail page with photo gallery and bid history"
```

---

## Task 9: Email Verification API

**Goal:** Build the API routes for sending a 6-digit verification code to a bidder's email and confirming it.

**Files:**
- Create: `app/api/verify/send/route.ts`
- Create: `app/api/verify/confirm/route.ts`

- [ ] **Step 1: Create the send verification code endpoint**

Create `app/api/verify/send/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { resend } from '@/lib/resend'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { email } = body

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
  }

  // Generate a 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString()

  // Expire in 10 minutes
  const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  // Mark any existing unused codes for this email as used
  const supabase = createServiceClient()
  await supabase
    .from('verification_codes')
    .update({ used: true })
    .eq('email', email.toLowerCase())
    .eq('used', false)

  // Insert the new code
  const { error: insertError } = await supabase
    .from('verification_codes')
    .insert({
      email: email.toLowerCase(),
      code,
      expires_at,
    })

  if (insertError) {
    return NextResponse.json({ error: 'Failed to create verification code' }, { status: 500 })
  }

  // Send the email
  const { error: emailError } = await resend.emails.send({
    from: process.env.EMAIL_FROM || 'Milo & Milo Motors <onboarding@resend.dev>',
    to: [email],
    subject: 'Your Verification Code — Milo & Milo Motors',
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
        <h2>Milo & Milo Motors</h2>
        <p>Your verification code is:</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center; margin: 16px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px;">${code}</span>
        </div>
        <p style="color: #6b7280; font-size: 14px;">This code expires in 10 minutes.</p>
      </div>
    `,
  })

  if (emailError) {
    console.error('Resend error:', emailError)
    return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
```

- [ ] **Step 2: Create the confirm verification code endpoint**

Create `app/api/verify/confirm/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { email, code } = body

  if (!email || !code) {
    return NextResponse.json({ error: 'Email and code are required' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Find a matching, unused, non-expired code
  const { data: match } = await supabase
    .from('verification_codes')
    .select('id')
    .eq('email', email.toLowerCase())
    .eq('code', code)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .limit(1)
    .single()

  if (!match) {
    return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })
  }

  // Mark the code as used
  await supabase
    .from('verification_codes')
    .update({ used: true })
    .eq('id', match.id)

  return NextResponse.json({ verified: true })
}
```

- [ ] **Step 3: Test the verification API**

Using `curl` from the terminal:

```bash
# Send a code (replace with your actual email)
curl -X POST http://localhost:3000/api/verify/send \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

Expected: `{"success": true}` and you receive an email with a 6-digit code.

```bash
# Confirm the code (replace with the code you received)
curl -X POST http://localhost:3000/api/verify/confirm \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com", "code": "123456"}'
```

Expected: `{"verified": true}` if the code matches, or `{"error": "Invalid or expired code"}` if wrong.

**Note:** If you're on Resend's free tier without a verified domain, you can only send to the email you signed up with. That's fine for testing.

- [ ] **Step 4: Commit**

```bash
git add app/api/verify/
git commit -m "feat: add email verification API (send code + confirm code)"
```

---

## Task 10: Bidding API

**Goal:** Build the API endpoint for placing bids. It validates the email is verified, the bid amount is high enough, and the auction hasn't ended.

**Files:**
- Create: `app/api/bids/route.ts`

- [ ] **Step 1: Create the bid placement endpoint**

Create `app/api/bids/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { car_id, bidder_name, bidder_email, amount } = body

  // Validate required fields
  if (!car_id || !bidder_name || !bidder_email || !amount) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }

  if (typeof amount !== 'number' || amount <= 0) {
    return NextResponse.json({ error: 'Bid amount must be a positive number' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // 1. Verify the email was recently verified (has a used code in the last 2 hours)
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  const { data: verification } = await supabase
    .from('verification_codes')
    .select('id')
    .eq('email', bidder_email.toLowerCase())
    .eq('used', true)
    .gt('created_at', twoHoursAgo)
    .limit(1)
    .single()

  if (!verification) {
    return NextResponse.json({ error: 'Email not verified. Please verify your email first.' }, { status: 403 })
  }

  // 2. Check the car exists and auction hasn't ended
  const { data: car } = await supabase
    .from('cars')
    .select('id, starting_price, auction_end_time')
    .eq('id', car_id)
    .single()

  if (!car) {
    return NextResponse.json({ error: 'Car not found' }, { status: 404 })
  }

  if (new Date(car.auction_end_time) < new Date()) {
    return NextResponse.json({ error: 'This auction has ended' }, { status: 400 })
  }

  // 3. Check bid is higher than current highest bid (or starting price)
  const { data: highestBid } = await supabase
    .from('bids')
    .select('amount')
    .eq('car_id', car_id)
    .order('amount', { ascending: false })
    .limit(1)
    .single()

  const minimumBid = highestBid ? highestBid.amount + 1 : car.starting_price

  if (amount < minimumBid) {
    return NextResponse.json(
      { error: `Bid must be at least $${minimumBid.toLocaleString()}` },
      { status: 400 }
    )
  }

  // 4. Insert the bid
  const { error: bidError } = await supabase
    .from('bids')
    .insert({
      car_id,
      bidder_name: bidder_name.trim(),
      bidder_email: bidder_email.toLowerCase(),
      amount,
    })

  if (bidError) {
    return NextResponse.json({ error: 'Failed to place bid' }, { status: 500 })
  }

  return NextResponse.json({ success: true, amount })
}
```

- [ ] **Step 2: Test the bid API**

```bash
# First verify your email (from Task 9)
# Then place a bid:
curl -X POST http://localhost:3000/api/bids \
  -H "Content-Type: application/json" \
  -d '{"car_id": "YOUR_CAR_UUID", "bidder_name": "Test Bidder", "bidder_email": "your-email@example.com", "amount": 5000}'
```

Expected: `{"success": true, "amount": 5000}`

Test validation:
- Submit a lower amount → should get "Bid must be at least..."
- Submit without verified email → should get "Email not verified"
- Submit for a non-existent car → should get "Car not found"

- [ ] **Step 3: Commit**

```bash
git add app/api/bids/
git commit -m "feat: add bidding API with validation and email verification check"
```

---

## Task 11: Bid Form Component (Full Implementation)

**Goal:** Replace the BidForm placeholder with the real implementation — a multi-step form that handles email verification and bid placement.

**Files:**
- Modify: `components/BidForm.tsx`

- [ ] **Step 1: Implement the full BidForm**

Replace the contents of `components/BidForm.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface BidFormProps {
  carId: string
  minimumBid: number
}

type Step = 'email' | 'code' | 'bid'

export default function BidForm({ carId, minimumBid }: BidFormProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/verify/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error)
      return
    }

    setStep('code')
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/verify/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error)
      return
    }

    setStep('bid')
  }

  async function handlePlaceBid(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const bidAmount = parseFloat(amount)
    if (isNaN(bidAmount) || bidAmount < minimumBid) {
      setError(`Bid must be at least $${minimumBid.toLocaleString()}`)
      setLoading(false)
      return
    }

    const res = await fetch('/api/bids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        car_id: carId,
        bidder_name: name,
        bidder_email: email,
        amount: bidAmount,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error)
      return
    }

    setSuccess(true)
    // Refresh the page to show the updated bid history
    router.refresh()
  }

  if (success) {
    return (
      <div className="text-center py-4 bg-green-50 rounded-md">
        <p className="font-medium text-green-700">Bid placed successfully!</p>
        <p className="text-sm text-green-600 mt-1">${parseFloat(amount).toLocaleString()}</p>
        <button
          onClick={() => { setSuccess(false); setStep('bid'); setAmount('') }}
          className="mt-3 text-sm text-blue-600 hover:text-blue-800"
        >
          Place another bid
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Step 1: Enter email */}
      {step === 'email' && (
        <form onSubmit={handleSendCode} className="space-y-3">
          <p className="text-sm text-gray-600 mb-3">
            Enter your email to verify and place a bid.
          </p>
          <div>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading || !name || !email}
            className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Sending code...' : 'Send Verification Code'}
          </button>
        </form>
      )}

      {/* Step 2: Enter verification code */}
      {step === 'code' && (
        <form onSubmit={handleVerifyCode} className="space-y-3">
          <p className="text-sm text-gray-600 mb-3">
            We sent a 6-digit code to <strong>{email}</strong>
          </p>
          <div>
            <input
              type="text"
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
          <button
            type="button"
            onClick={() => { setStep('email'); setCode(''); setError('') }}
            className="w-full text-sm text-gray-500 hover:text-gray-700"
          >
            Use a different email
          </button>
        </form>
      )}

      {/* Step 3: Place bid */}
      {step === 'bid' && (
        <form onSubmit={handlePlaceBid} className="space-y-3">
          <p className="text-sm text-green-600 mb-3">
            Verified as <strong>{email}</strong>
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Bid (minimum ${minimumBid.toLocaleString()})
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-400">$</span>
              <input
                type="number"
                step="1"
                min={minimumBid}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                placeholder={minimumBid.toString()}
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading || !amount}
            className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 font-medium"
          >
            {loading ? 'Placing bid...' : `Place Bid`}
          </button>
        </form>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Test the full bidding flow**

1. Run `npm run dev`
2. Navigate to a car detail page
3. In the bid panel on the right:
   - Enter your name and email → click "Send Verification Code"
   - Check your email for the 6-digit code
   - Enter the code → click "Verify Code"
   - Enter a bid amount (>= starting price) → click "Place Bid"
4. You should see "Bid placed successfully!"
5. The bid history table should update to show your bid
6. Try placing another bid — the minimum should have increased
7. Try placing a bid below the minimum — should show an error

- [ ] **Step 3: Commit**

```bash
git add components/BidForm.tsx
git commit -m "feat: implement full bid form with email verification flow"
```

---

## Task 12: Next.js Config for Images

**Goal:** Configure Next.js to allow images from Supabase Storage.

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1: Update next.config.ts to allow Supabase image domains**

Replace the contents of `next.config.ts`:

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
}

export default nextConfig
```

Note: We're using `<img>` tags in this project for simplicity, so this step is only needed if you later switch to Next.js `<Image>` component for optimization. Including it now to prevent future confusion.

- [ ] **Step 2: Commit**

```bash
git add next.config.ts
git commit -m "chore: configure Next.js to allow Supabase image domains"
```

---

## Task 13: Deployment

**Goal:** Push to GitHub and deploy to Vercel.

**Files:** None — this is all CLI/dashboard work.

- [ ] **Step 1: Create the GitHub repository**

```bash
gh repo create bajcula/milo-and-milo-motors --public --source=. --remote=origin
```

- [ ] **Step 2: Push all code**

```bash
git push -u origin main
```

- [ ] **Step 3: Deploy to Vercel**

1. Go to https://vercel.com and sign in with your GitHub account
2. Click "Add New..." → "Project"
3. Import the `bajcula/milo-and-milo-motors` repository
4. Vercel will auto-detect it as a Next.js project
5. **Before deploying**, expand "Environment Variables" and add ALL of these:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...your-anon-key` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...your-service-role-key` |
| `RESEND_API_KEY` | `re_your-api-key` |
| `EMAIL_FROM` | `Milo & Milo Motors <onboarding@resend.dev>` |

6. Click "Deploy"
7. Wait for the build to complete (~1-2 minutes)
8. You'll get a URL like `milo-and-milo-motors.vercel.app`

- [ ] **Step 4: Test the deployed site**

1. Open the Vercel URL
2. You should see the home page with any cars you added during development
3. Test the full flow:
   - View car listings
   - Click into a car detail page
   - Verify email and place a bid
   - Log into the admin panel
   - Add/edit a car
4. Countdown timers should be ticking live

- [ ] **Step 5: Share the URL**

Your friend can now access:
- **Public site:** `https://milo-and-milo-motors.vercel.app`
- **Admin panel:** `https://milo-and-milo-motors.vercel.app/admin`

He logs in with the credentials created in Prerequisite P3.

---

## Post-Launch Notes

### Things to set up later (when ready for real users):

1. **Custom domain** — In Vercel dashboard → Settings → Domains, add your friend's domain (e.g., `miloandmilomotors.com`). Vercel handles SSL automatically.

2. **Production email sending** — Verify a domain in Resend (Resend Dashboard → Domains → Add Domain). Then update `EMAIL_FROM` in Vercel environment variables to use the verified domain (e.g., `Milo & Milo Motors <hello@miloandmilomotors.com>`).

3. **Second admin user** — In Supabase Dashboard → Authentication → Users → Add User for the second Milos.

### Costs at this scale:
- **Vercel Free Tier** — covers up to 100GB bandwidth/month. Plenty for this.
- **Supabase Free Tier** — 500MB database, 1GB storage, 50,000 monthly active users. Way more than needed.
- **Resend Free Tier** — 100 emails/day, 3,000/month. Enough for verification codes.

**Total monthly cost: $0**
