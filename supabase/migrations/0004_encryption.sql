-- UsTwo: end-to-end encryption.
--   pubkey  'pubkey:A' / 'pubkey:B', data { jwk } : each phone's public key (personal: only its author can edit it)
-- Every other entry's `data` now holds ciphertext ({ enc: { v, iv, ct } }) produced on the phones.
-- The server never sees a key that can decrypt it. `promptKey` stays readable on answers because
-- the blind-reveal policy (has_answered) needs it; it is a random id with no content.

alter table public.entries drop constraint entries_kind_check;
alter table public.entries add constraint entries_kind_check check (kind in
  ('prompt','answer','answered','vibe','note','bucket','checkin','challenge','challenge_progress',
   'spark','spark_pick','spark_pref','spark_done','profile','spark_wish','pubkey'));

drop policy entries_update on public.entries;
create policy entries_update on public.entries for update to authenticated
  using (
    public.couple_role(couple_id) is not null
    and (kind not in ('answer','answered','vibe','challenge_progress','note','checkin','spark','spark_pref','profile','spark_wish','pubkey')
         or author_uid = auth.uid())
  )
  with check (public.couple_role(couple_id) is not null);

-- A public key can only be published under your own role, so nobody can plant a key for their partner.
create or replace function public.entries_pubkey_guard()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.kind = 'pubkey' and new.id <> 'pubkey:' || public.couple_role(new.couple_id) then
    raise exception 'pubkey id must match your role';
  end if;
  return new;
end $$;

drop trigger if exists entries_pubkey_guard on public.entries;
create trigger entries_pubkey_guard before insert or update on public.entries
  for each row execute function public.entries_pubkey_guard();
