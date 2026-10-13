-- =============================================================================
-- AURELIA Phase 5 — Schema, Auth helpers, RLS, secure pricing foundation
-- Run in Supabase SQL Editor (or via `supabase db push` / migration CLI).
-- =============================================================================

-- Extensions
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- profiles (extends auth.users)
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text,
  full_name     text,
  phone         text,
  role          text not null default 'customer' check (role in ('customer', 'admin')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- products (server is source of truth for price; client catalog is a mirror)
-- -----------------------------------------------------------------------------
create table if not exists public.products (
  id                text primary key,                 -- e.g. necklace-mesh
  sku               text not null unique,
  name              text not null,
  category          text not null check (category in ('necklace','bracelet','ring','earrings','headpiece')),
  tag               text not null default '',
  price_inr         integer not null check (price_inr > 0),
  image             text not null default '/assets/placeholder.svg',
  image_verified    boolean not null default false,
  specs_verified    boolean not null default false,
  active            boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category) where active;
create index if not exists products_price_idx on public.products (price_inr) where active;

-- -----------------------------------------------------------------------------
-- orders + order_items
-- Prices are snapshotted at order creation time from public.products (server).
-- Client-supplied prices are NEVER trusted.
-- -----------------------------------------------------------------------------
create type public.order_status as enum (
  'pending',          -- created, awaiting payment
  'payment_pending',  -- Razorpay order created
  'paid',
  'failed',
  'cancelled',
  'fulfilled',
  'refunded'
);

create table if not exists public.orders (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users(id) on delete set null,  -- null = guest
  guest_email         text,
  status              public.order_status not null default 'pending',
  currency            text not null default 'INR',
  subtotal_inr        integer not null check (subtotal_inr >= 0),
  shipping_inr        integer not null default 0 check (shipping_inr >= 0),
  total_inr           integer not null check (total_inr >= 0),
  item_count          integer not null default 0,
  -- Razorpay
  razorpay_order_id   text unique,
  razorpay_payment_id text,
  razorpay_signature  text,
  -- contact / shipping snapshot
  shipping_name       text,
  shipping_phone      text,
  shipping_line1      text,
  shipping_line2      text,
  shipping_city       text,
  shipping_state      text,
  shipping_postal     text,
  shipping_country    text default 'IN',
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  paid_at             timestamptz
);

create index if not exists orders_user_idx on public.orders (user_id, created_at desc);
create index if not exists orders_status_idx on public.orders (status);

create table if not exists public.order_items (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references public.orders(id) on delete cascade,
  product_id      text not null references public.products(id),
  sku             text not null,
  name            text not null,           -- snapshot
  unit_price_inr  integer not null check (unit_price_inr > 0),  -- snapshot from products.price_inr
  quantity        integer not null check (quantity >= 1 and quantity <= 10),
  line_total_inr  integer not null check (line_total_inr > 0),
  created_at      timestamptz not null default now()
);

create index if not exists order_items_order_idx on public.order_items (order_id);

-- -----------------------------------------------------------------------------
-- updated_at helper
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Helper: is current user admin?
-- -----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- ---- profiles ----
drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));
  -- role cannot be self-escalated; only service role / admin can change roles

drop policy if exists "Admins manage profiles" on public.profiles;
create policy "Admins manage profiles"
  on public.profiles for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---- products ----
-- Public read of active products only
drop policy if exists "Anyone can read active products" on public.products;
create policy "Anyone can read active products"
  on public.products for select
  using (active = true or public.is_admin());

-- Writes only via service role (no policy for authenticated insert/update/delete)
-- Admins can manage via service role or explicit admin policy:
drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products"
  on public.products for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---- orders ----
-- Users see their own orders; guests cannot list (only service role creates + returns id)
drop policy if exists "Users read own orders" on public.orders;
create policy "Users read own orders"
  on public.orders for select
  using (auth.uid() = user_id or public.is_admin());

-- Inserts only via service role (API route uses service key). No client insert policy.
drop policy if exists "Admins manage orders" on public.orders;
create policy "Admins manage orders"
  on public.orders for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---- order_items ----
drop policy if exists "Users read own order items" on public.order_items;
create policy "Users read own order items"
  on public.order_items for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

drop policy if exists "Admins manage order items" on public.order_items;
create policy "Admins manage order items"
  on public.order_items for all
  using (public.is_admin())
  with check (public.is_admin());

-- =============================================================================
-- Grants (authenticated + anon can select where policies allow)
-- =============================================================================
grant usage on schema public to anon, authenticated;
grant select on public.products to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select on public.orders to authenticated;
grant select on public.order_items to authenticated;

-- Service role bypasses RLS (used by Next.js API routes for order creation & pricing)
