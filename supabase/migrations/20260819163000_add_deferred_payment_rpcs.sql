create or replace function public.stripe_mark_booking_authorized(
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
  perform set_config('app.stripe_payment_write', 'on', true);

  update public.bookings
  set status = 'accepted',
      payment_status = 'authorized',
      tracking_status = 'booking_created',
      platform_fee = p_platform_fee,
      driver_amount = p_driver_amount
  where id = p_booking_id
    and status in ('pending', 'accepted')
    and payment_status in ('pending', 'authorized');

  if not found then
    raise exception 'Booking cannot be authorized';
  end if;
end;
$$;

create or replace function public.stripe_complete_booking(
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
  perform set_config('app.stripe_payment_write', 'on', true);

  update public.bookings
  set status = 'completed',
      payment_status = 'paid',
      tracking_status = 'payout',
      platform_fee = p_platform_fee,
      driver_amount = p_driver_amount
  where id = p_booking_id;

  if not found then
    raise exception 'Booking not found';
  end if;
end;
$$;

revoke all on function public.stripe_mark_booking_authorized(uuid, numeric, numeric) from public, anon, authenticated;
revoke all on function public.stripe_complete_booking(uuid, numeric, numeric) from public, anon, authenticated;
grant execute on function public.stripe_mark_booking_authorized(uuid, numeric, numeric) to service_role;
grant execute on function public.stripe_complete_booking(uuid, numeric, numeric) to service_role;
