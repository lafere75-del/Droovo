create table if not exists public.mobile_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null unique,
  platform text not null check (platform in ('ios', 'android')),
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

alter table public.mobile_devices enable row level security;
revoke all on public.mobile_devices from anon, authenticated;
create index if not exists mobile_devices_user_id_idx on public.mobile_devices(user_id);
