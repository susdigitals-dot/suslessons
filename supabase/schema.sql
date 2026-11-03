-- sus.lessons — Supabase schema
-- Supabase Dashboard → SQL Editor → New query → এই পুরো ফাইলটা পেস্ট করে Run।
-- বারবার চালালেও সমস্যা নেই।

-- ── অ্যাডমিন ───────────────────────────
create table if not exists public.admins (
  email text primary key
);

-- যার ইমেইল admins টেবিলে আছে, শুধু সে-ই লিখতে পারবে
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.admins where lower(email) = lower(auth.jwt() ->> 'email'));
$$;

-- ── বই ───────────────────────────
create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  title_bn text default '',
  author text default '',
  hook text default '',
  description text default '',
  laws jsonb not null default '[]',        -- [{no, name, line}]
  cover_url text default '',
  affiliate jsonb not null default '[]',   -- [{store, url}]
  pdf_url text not null default '',
  featured boolean not null default false,
  sort int not null default 100,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── গল্প (লেখা + স্লাইড) ───────────────────────────
create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  type text not null default 'blog' check (type in ('blog', 'slides')),
  title text not null,
  excerpt text default '',
  last_line text default '',
  cover_url text default '',
  book_slug text references public.books(slug) on update cascade on delete set null,
  law text default '',
  tags text[] not null default '{}',
  body text default '',
  slides jsonb not null default '[]',      -- [{image, speaker, text}]
  published boolean not null default false,
  published_at date default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists stories_pub_idx on public.stories (published, published_at desc);

-- ── সাইট সেটিংস ───────────────────────────
create table if not exists public.settings (
  key text primary key,
  value jsonb not null default '{}'
);

-- updated_at নিজে থেকে বদলাও
create or replace function public.touch() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists books_touch on public.books;
create trigger books_touch before update on public.books for each row execute function public.touch();
drop trigger if exists stories_touch on public.stories;
create trigger stories_touch before update on public.stories for each row execute function public.touch();

-- ── Row Level Security ───────────────────────────
alter table public.admins enable row level security;
alter table public.books enable row level security;
alter table public.stories enable row level security;
alter table public.settings enable row level security;

drop policy if exists "admins read self" on public.admins;
create policy "admins read self" on public.admins for select using (public.is_admin());

drop policy if exists "books public read" on public.books;
create policy "books public read" on public.books for select using (published or public.is_admin());
drop policy if exists "books admin write" on public.books;
create policy "books admin write" on public.books for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "stories public read" on public.stories;
create policy "stories public read" on public.stories for select using (published or public.is_admin());
drop policy if exists "stories admin write" on public.stories;
create policy "stories admin write" on public.stories for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "settings public read" on public.settings;
create policy "settings public read" on public.settings for select using (true);
drop policy if exists "settings admin write" on public.settings;
create policy "settings admin write" on public.settings for all using (public.is_admin()) with check (public.is_admin());

-- ── ছবি / PDF রাখার জায়গা (Storage) ───────────────────────────
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects for select using (bucket_id = 'media');
drop policy if exists "media admin insert" on storage.objects;
create policy "media admin insert" on storage.objects for insert with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects for update using (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects for delete using (bucket_id = 'media' and public.is_admin());

-- ── ভিজিট আর লিংক ক্লিক গোনা (admin → ড্যাশবোর্ড) ───────────────────────────
-- যে কেউ লিখতে পারবে (সাইটের ভিজিটর), পড়তে পারবে শুধু admin। IP বা ব্যক্তিগত তথ্য রাখা হয় না।
create table if not exists public.events (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('view', 'click')),
  path text not null default '' check (length(path) <= 300),
  label text not null default '' check (length(label) <= 200),
  href text not null default '' check (length(href) <= 600),
  ref text not null default '' check (length(ref) <= 300),
  sid text not null default '' check (length(sid) <= 40),
  created_at timestamptz not null default now()
);
create index if not exists events_time_idx on public.events (created_at desc);
alter table public.events enable row level security;

drop policy if exists "events anyone insert" on public.events;
create policy "events anyone insert" on public.events for insert to anon, authenticated with check (true);
drop policy if exists "events admin read" on public.events;
create policy "events admin read" on public.events for select using (public.is_admin());
drop policy if exists "events admin delete" on public.events;
create policy "events admin delete" on public.events for delete using (public.is_admin());

-- ড্যাশবোর্ডের হিসাব: গত p_days দিনের ভিউ, ভিজিটর, ক্লিক, সেরা লিংক/পেজ
create or replace function public.event_stats(p_days int default 7)
returns jsonb
language sql stable security definer set search_path = public
as $$
  with e as (
    select * from public.events
    where public.is_admin() and created_at >= now() - make_interval(days => p_days)
  )
  select jsonb_build_object(
    'views',    (select count(*) from e where kind = 'view'),
    'visitors', (select count(distinct sid) from e where kind = 'view'),
    'clicks',   (select count(*) from e where kind = 'click'),
    'top_links', coalesce((select jsonb_agg(t) from (
        select max(label) as label, href, count(*) as n from e where kind = 'click'
        group by href order by n desc limit 25) t), '[]'),
    'top_pages', coalesce((select jsonb_agg(t) from (
        select path, count(*) as n from e where kind = 'view'
        group by path order by n desc limit 15) t), '[]'),
    'top_refs', coalesce((select jsonb_agg(t) from (
        select ref, count(*) as n from e where kind = 'view' and ref <> ''
        group by ref order by n desc limit 10) t), '[]'),
    'daily', coalesce((select jsonb_agg(t order by t.d) from (
        select (created_at at time zone 'Asia/Kolkata')::date as d,
               count(*) filter (where kind = 'view') as views,
               count(*) filter (where kind = 'click') as clicks
        from e group by 1) t), '[]')
  );
$$;

-- ── দোকান: ই-বুক, নোটস, গাইড, চেকলিস্ট (বিক্রি) + প্রস্তাবিত জিনিস (affiliate) ───────────────────────────
-- পেমেন্ট আর ফাইল পাঠানো হয় buy_url-এর প্ল্যাটফর্মে (Razorpay Payment Page / Instamojo / Cosmofeed / Gumroad ইত্যাদি)
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  kind text not null default 'ebook' check (kind in ('ebook', 'notes', 'guide', 'checklist', 'affiliate')),
  title text not null,
  subtitle text default '',
  description text default '',
  includes jsonb not null default '[]',    -- ["৪২ পাতার PDF", "প্রিন্ট করার মতো চেকলিস্ট"]
  cover_url text default '',
  price int not null default 0,            -- টাকায়; ০ = ফ্রি
  mrp int not null default 0,              -- কাটা দাম (থাকলে)
  format text default '',                  -- PDF · ৪২ পাতা
  buy_url text not null default '',        -- পেমেন্ট লিংক / affiliate লিংক
  store text default '',                   -- affiliate হলে দোকানের নাম (Amazon)
  preview_url text default '',             -- ফ্রি স্যাম্পল PDF
  featured boolean not null default false,
  sort int not null default 100,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products for each row execute function public.touch();
alter table public.products enable row level security;
drop policy if exists "products public read" on public.products;
create policy "products public read" on public.products for select using (published or public.is_admin());
drop policy if exists "products admin write" on public.products;
create policy "products admin write" on public.products for all using (public.is_admin()) with check (public.is_admin());

-- ── যোগাযোগ ফর্মের মেসেজ ───────────────────────────
-- যে কেউ পাঠাতে পারবে, পড়তে পারবে শুধু admin
create table if not exists public.messages (
  id bigint generated always as identity primary key,
  name text not null check (length(name) between 1 and 120),
  contact text not null check (length(contact) between 3 and 160),   -- ইমেইল বা ফোন
  topic text not null default '' check (length(topic) <= 60),
  body text not null check (length(body) between 1 and 4000),
  done boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists messages_time_idx on public.messages (created_at desc);
alter table public.messages enable row level security;
drop policy if exists "messages anyone insert" on public.messages;
create policy "messages anyone insert" on public.messages for insert to anon, authenticated with check (done = false);
drop policy if exists "messages admin all" on public.messages;
create policy "messages admin all" on public.messages for all using (public.is_admin()) with check (public.is_admin());

-- ── চা খাওয়ানো (Razorpay) ───────────────────────────
-- লেখে শুধু razorpay-webhook Edge Function (service role), পড়তে পারবে শুধু admin
create table if not exists public.donations (
  id bigint generated always as identity primary key,
  payment_id text unique not null,
  order_id text not null default '',
  amount int not null,                     -- টাকায়
  status text not null default 'captured', -- captured / failed
  method text not null default '',         -- upi, card, netbanking …
  email text not null default '',
  contact text not null default '',
  purpose text not null default '',        -- cha
  items text not null default '',          -- ২টা ভাঁড়ের চা · ১টা সন পাপড়ি
  created_at timestamptz not null default now()
);
alter table public.donations add column if not exists items text not null default '';
create index if not exists donations_time_idx on public.donations (created_at desc);
alter table public.donations enable row level security;
drop policy if exists "donations admin all" on public.donations;
create policy "donations admin all" on public.donations for all using (public.is_admin()) with check (public.is_admin());

-- ── প্রথম অ্যাডমিন ───────────────────────────
-- যে ইমেইল দিয়ে admin প্যানেলে লগইন করবে, সেটা এখানে দাও
insert into public.admins (email) values ('maitys8289@gmail.com') on conflict do nothing;

-- ডিফল্ট সেটিংস (admin প্যানেল থেকে বদলানো যাবে)
insert into public.settings (key, value) values ('site', '{}') on conflict do nothing;
