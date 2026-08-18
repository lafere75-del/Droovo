revoke all privileges on table public.package_recipients from authenticated;
grant select, insert, update, delete on table public.package_recipients to authenticated;
revoke all privileges on table public.package_recipients from anon;
