-- UsTwo: entry kinds for the Spark (intimacy) tab.
--   spark       one partner's response to tonight's idea (personal)
--   spark_pick  tonight's shared shuffle counter (either partner)
--   spark_pref  one partner's opt-in and hidden ideas (personal)
--   spark_done  a shared memory of an idea you both did (either partner)

alter table public.entries drop constraint entries_kind_check;
alter table public.entries add constraint entries_kind_check check (kind in
  ('prompt','answer','answered','vibe','note','bucket','checkin','challenge','challenge_progress',
   'spark','spark_pick','spark_pref','spark_done'));

drop policy entries_update on public.entries;
create policy entries_update on public.entries for update to authenticated
  using (
    public.couple_role(couple_id) is not null
    and (kind not in ('answer','answered','vibe','challenge_progress','note','checkin','spark','spark_pref')
         or author_uid = auth.uid())
  )
  with check (public.couple_role(couple_id) is not null);
