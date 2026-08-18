alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists phone text,
  add column if not exists city text,
  add column if not exists photo_url text,
  add column if not exists travel_mode text,
  add column if not exists bio text,
  add column if not exists verified_identity boolean not null default false,
  add column if not exists verified_email boolean not null default false,
  add column if not exists verified_phone boolean not null default false;

alter table public.packages
  add column if not exists image_url text;
