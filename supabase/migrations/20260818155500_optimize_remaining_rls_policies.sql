drop policy if exists "Users can read their notifications" on public.notifications;
create policy "Users can read their notifications"
on public.notifications for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can update their notifications" on public.notifications;
create policy "Users can update their notifications"
on public.notifications for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can create reviews" on public.reviews;
create policy "Users can create reviews"
on public.reviews for insert to authenticated
with check ((select auth.uid()) = reviewer_id);

drop policy if exists "Admins can read all identity verifications" on public.identity_verifications;
drop policy if exists "Users read own identity verification" on public.identity_verifications;
create policy "Users read own identity verification"
on public.identity_verifications for select to authenticated
using ((select auth.uid()) = user_id or (select private.is_admin()));
