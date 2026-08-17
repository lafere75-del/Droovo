create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, role, created_at)
  values (new.id, new.email, 'user', now())
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.create_message_notification()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.notifications (user_id, title, message, type)
  values (new.receiver_id, 'Nouveau message', 'Vous avez reçu un nouveau message.', 'message');
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.create_message_notification() from public, anon, authenticated;

create policy "Participants read matches" on public.matches for select to authenticated
using (
  exists (
    select 1 from public.packages p
    left join public.trips t on t.id = matches.trip_id
    where p.id = matches.package_id
      and (p.user_id = (select auth.uid()) or p.sender_id = (select auth.uid()) or t.user_id = (select auth.uid()))
  ) or private.is_admin()
);

create index bookings_driver_id_idx on public.bookings (driver_id);
create index bookings_package_id_idx on public.bookings (package_id);
create index bookings_sender_id_idx on public.bookings (sender_id);
create index bookings_trip_id_idx on public.bookings (trip_id);
create index identity_verifications_user_id_idx on public.identity_verifications (user_id);
create index matches_package_id_idx on public.matches (package_id);
create index matches_trip_id_idx on public.matches (trip_id);
create index packages_sender_id_idx on public.packages (sender_id);
create index packages_user_id_idx on public.packages (user_id);
create index payments_booking_id_idx on public.payments (booking_id);
create index payments_driver_id_idx on public.payments (driver_id);
create index payments_package_id_idx on public.payments (package_id);
create index payments_sender_id_idx on public.payments (sender_id);
create index trips_user_id_idx on public.trips (user_id);
