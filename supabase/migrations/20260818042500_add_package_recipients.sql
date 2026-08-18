create table if not exists public.package_recipients (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null unique references public.packages(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  is_sender boolean not null default false,
  full_name text,
  email text,
  phone text,
  consent_confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint package_recipients_contact_valid check (
    (is_sender and full_name is null and email is null and phone is null)
    or
    (
      not is_sender
      and nullif(btrim(full_name), '') is not null
      and (nullif(btrim(email), '') is not null or nullif(btrim(phone), '') is not null)
      and consent_confirmed_at is not null
    )
  )
);

alter table public.package_recipients enable row level security;

revoke all on table public.package_recipients from anon;
grant select, insert, update, delete on table public.package_recipients to authenticated;

drop policy if exists package_recipients_select_own on public.package_recipients;
create policy package_recipients_select_own
on public.package_recipients for select
to authenticated
using (sender_id = (select auth.uid()));

drop policy if exists package_recipients_insert_own on public.package_recipients;
create policy package_recipients_insert_own
on public.package_recipients for insert
to authenticated
with check (
  sender_id = (select auth.uid())
  and exists (
    select 1 from public.packages
    where packages.id = package_recipients.package_id
      and packages.user_id = (select auth.uid())
  )
);

drop policy if exists package_recipients_update_own on public.package_recipients;
create policy package_recipients_update_own
on public.package_recipients for update
to authenticated
using (sender_id = (select auth.uid()))
with check (
  sender_id = (select auth.uid())
  and exists (
    select 1 from public.packages
    where packages.id = package_recipients.package_id
      and packages.user_id = (select auth.uid())
  )
);

drop policy if exists package_recipients_delete_own on public.package_recipients;
create policy package_recipients_delete_own
on public.package_recipients for delete
to authenticated
using (sender_id = (select auth.uid()));

create index if not exists package_recipients_sender_id_idx
on public.package_recipients(sender_id);
