create or replace function public.stripe_mark_booking_paid(
  p_booking_id uuid,
  p_platform_fee numeric,
  p_driver_amount numeric
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(current_setting('request.jwt.claim.role', true), '') <> 'service_role' then
    raise exception 'Server payment role required';
  end if;

  perform set_config('app.stripe_payment_write', 'on', true);

  update public.bookings
  set payment_status = 'paid',
      tracking_status = 'paid',
      platform_fee = p_platform_fee,
      driver_amount = p_driver_amount
  where id = p_booking_id;

  if not found then
    raise exception 'Booking not found';
  end if;
end;
$$;

revoke all on function public.stripe_mark_booking_paid(uuid, numeric, numeric) from public;
revoke all on function public.stripe_mark_booking_paid(uuid, numeric, numeric) from anon;
revoke all on function public.stripe_mark_booking_paid(uuid, numeric, numeric) from authenticated;
grant execute on function public.stripe_mark_booking_paid(uuid, numeric, numeric) to service_role;

create or replace function public.guard_booking_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  p_owner uuid;
  t_owner uuid;
  actor uuid := auth.uid();
  request_role text := coalesce(current_setting('request.jwt.claim.role', true), '');
  stripe_payment_write text := coalesce(current_setting('app.stripe_payment_write', true), '');
begin
  if tg_op = 'INSERT' then
    select user_id into p_owner from public.packages where id = new.package_id;
    select user_id into t_owner from public.trips where id = new.trip_id;
    if p_owner is null or t_owner is null or p_owner = t_owner or actor not in (p_owner, t_owner) then raise exception 'Réservation invalide'; end if;
    new.sender_id := p_owner; new.driver_id := t_owner; new.created_by := actor;
    new.status := 'pending'; new.payment_status := 'pending'; new.driver_amount := 0; new.platform_fee := 0; new.tracking_status := 'booking_created';
    return new;
  end if;
  if stripe_payment_write = 'on' and request_role = 'service_role' then return new; end if;
  if pg_trigger_depth() > 1 then return new; end if;
  if new.package_id <> old.package_id or new.trip_id <> old.trip_id or new.sender_id <> old.sender_id or new.driver_id <> old.driver_id or new.created_by is distinct from old.created_by then raise exception 'Participants et réservation non modifiables'; end if;
  if new.payment_status is distinct from old.payment_status or new.driver_amount is distinct from old.driver_amount or new.platform_fee is distinct from old.platform_fee then raise exception 'Paiement modifiable uniquement par le serveur Stripe'; end if;
  if new.status is distinct from old.status then
    if old.status <> 'pending' or actor = old.created_by or actor not in (old.sender_id, old.driver_id) or new.status not in ('accepted','rejected') then raise exception 'Transition de réservation non autorisée'; end if;
  end if;
  if new.tracking_status is distinct from old.tracking_status or new.picked_up_at is distinct from old.picked_up_at or new.delivered_at is distinct from old.delivered_at then
    if actor <> old.driver_id or old.status <> 'accepted' then raise exception 'Suivi réservé au transporteur après acceptation'; end if;
    if (old.tracking_status='booking_created' and new.tracking_status<>'picked_up') or (old.tracking_status='picked_up' and new.tracking_status<>'in_transit') or (old.tracking_status='in_transit' and new.tracking_status<>'delivered') or old.tracking_status='delivered' then raise exception 'Étape de suivi invalide'; end if;
  end if;
  return new;
end;
$$;
