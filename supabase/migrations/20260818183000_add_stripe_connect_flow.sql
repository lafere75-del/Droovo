alter table public.payments
  add column if not exists amount_cents integer,
  add column if not exists commission_cents integer,
  add column if not exists processing_fee_cents integer default 0,
  add column if not exists driver_amount_cents integer,
  add column if not exists currency text default 'eur',
  add column if not exists stripe_checkout_session_id text,
  add column if not exists stripe_charge_id text,
  add column if not exists stripe_balance_transaction_id text,
  add column if not exists stripe_transfer_id text,
  add column if not exists paid_at timestamptz,
  add column if not exists released_at timestamptz;

alter table public.payment_settings
  add column if not exists connect_onboarding_status text default 'not_started';

create unique index if not exists payments_booking_id_unique on public.payments (booking_id);
create unique index if not exists payments_checkout_session_unique on public.payments (stripe_checkout_session_id) where stripe_checkout_session_id is not null;
create unique index if not exists payments_transfer_unique on public.payments (stripe_transfer_id) where stripe_transfer_id is not null;

create or replace function private.protect_booking_payment_fields()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if (select auth.role()) = 'authenticated' and (
    new.payment_status is distinct from old.payment_status or
    new.driver_amount is distinct from old.driver_amount or
    new.platform_fee is distinct from old.platform_fee
  ) then
    raise exception 'Payment fields can only be updated by the payment service';
  end if;
  return new;
end;
$$;

revoke all on function private.protect_booking_payment_fields() from public;

drop trigger if exists protect_booking_payment_fields_before_update on public.bookings;
create trigger protect_booking_payment_fields_before_update
before update on public.bookings
for each row execute function private.protect_booking_payment_fields();
