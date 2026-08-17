alter table public.identity_verifications enable row level security;
alter table public.payments enable row level security;
alter table public.payment_settings enable row level security;
alter table public.tracking_events enable row level security;

create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated;

create policy "Users submit own identity verification"
on public.identity_verifications for insert to authenticated
with check ((select auth.uid()) = user_id and status = 'pending');

create policy "Users read own identity verification"
on public.identity_verifications for select to authenticated
using ((select auth.uid()) = user_id or private.is_admin());

create policy "Admins update identity verification"
on public.identity_verifications for update to authenticated
using (private.is_admin()) with check (private.is_admin());

create policy "Participants read payments"
on public.payments for select to authenticated
using ((select auth.uid()) = sender_id or (select auth.uid()) = driver_id or private.is_admin());

create policy "Users read own payment settings"
on public.payment_settings for select to authenticated
using ((select auth.uid()) = user_id);
create policy "Users insert own payment settings"
on public.payment_settings for insert to authenticated
with check ((select auth.uid()) = user_id);
create policy "Users update own payment settings"
on public.payment_settings for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create unique index payment_settings_user_id_key on public.payment_settings (user_id);

create policy "Participants read tracking events"
on public.tracking_events for select to authenticated
using (
  exists (
    select 1 from public.bookings b
    where b.id = tracking_events.booking_id
      and ((select auth.uid()) = b.sender_id or (select auth.uid()) = b.driver_id)
  ) or private.is_admin()
);
create policy "Participants create tracking events"
on public.tracking_events for insert to authenticated
with check (
  exists (
    select 1 from public.bookings b
    where b.id = tracking_events.booking_id
      and ((select auth.uid()) = b.sender_id or (select auth.uid()) = b.driver_id)
  )
);

update storage.buckets
set file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'package-images';

drop policy if exists "Authenticated users can upload package images" on storage.objects;
drop policy if exists "Users can upload package images" on storage.objects;
create policy "Users upload package images in own folder"
on storage.objects for insert to authenticated
with check (bucket_id = 'package-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Users update own package images"
on storage.objects for update to authenticated
using (bucket_id = 'package-images' and owner_id = (select auth.uid())::text)
with check (bucket_id = 'package-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Users delete own package images"
on storage.objects for delete to authenticated
using (bucket_id = 'package-images' and owner_id = (select auth.uid())::text);

