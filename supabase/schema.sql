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
