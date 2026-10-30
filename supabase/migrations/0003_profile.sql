-- UsTwo: each partner's display name.
--   profile  'profile:A' / 'profile:B', data { name } (personal: only its author can edit it)

alter table public.entries drop constraint entries_kind_check;
alter table public.entries add constraint entries_kind_check check (kind in
  ('prompt','answer','answered','vibe','note','bucket','checkin','challenge','challenge_progress',
   'spark','spark_pick','spark_pref','spark_done','profile'));

drop policy entries_update on public.entries;
create policy entries_update on public.entries for update to authenticated
  using (
    public.couple_role(couple_id) is not null
    and (kind not in ('answer','answered','vibe','challenge_progress','note','checkin','spark','spark_pref','profile')
         or author_uid = auth.uid())
  )
  with check (public.couple_role(couple_id) is not null);
