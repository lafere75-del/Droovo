create schema if not exists private;

create or replace function private.enforce_profile_role_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.role := 'user';
  elsif tg_op = 'UPDATE' then
    new.role := old.role;
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_profile_role_guard_before_write on public.profiles;
create trigger enforce_profile_role_guard_before_write
before insert or update on public.profiles
for each row execute function private.enforce_profile_role_guard();

