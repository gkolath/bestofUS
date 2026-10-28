-- UsTwo schema: couples paired by a 6-digit code, and a shared `entries` table.
-- Run in the Supabase SQL editor, or with `supabase db push`.
-- Requires: Auth > Anonymous sign-ins enabled; the pgcrypto extension (installed by default in the
-- `extensions` schema on Supabase).

create extension if not exists pgcrypto with schema extensions;

-- ---------- Tables ----------

create table public.couples (
  id               uuid primary key default gen_random_uuid(),
  code             text unique,               -- 6-digit pairing code; cleared once partner B joins
  code_expires_at  timestamptz,
  member_a         uuid not null references auth.users(id) on delete cascade,
  member_b         uuid references auth.users(id) on delete set null,
  created_at       timestamptz not null default now()
);

create table public.entries (
  couple_id   uuid not null references public.couples(id) on delete cascade,
  id          text not null,                  -- client-generated, e.g. 'vibe:A', 'note:<uuid>'
  kind        text not null check (kind in
                ('prompt','answer','answered','vibe','note','bucket','checkin','challenge','challenge_progress')),
  author      text not null check (author in ('A','B')),   -- set by trigger from membership
  author_uid  uuid not null,                               -- set by trigger from auth.uid()
  data        jsonb not null default '{}'::jsonb check (octet_length(data::text) < 20000),
  deleted     boolean not null default false,              -- tombstones instead of hard deletes
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (couple_id, id)
);
create index entries_couple_kind_idx on public.entries (couple_id, kind);

create table public.pair_attempts (
  uid uuid not null,
  at  timestamptz not null default now()
);
create index pair_attempts_uid_at_idx on public.pair_attempts (uid, at);

-- ---------- Helpers (security definer so policies can use them without recursion) ----------

create or replace function public.couple_role(p_couple uuid)
returns text language sql stable security definer set search_path = '' as $$
  select case when c.member_a = auth.uid() then 'A'
              when c.member_b = auth.uid() then 'B' end
  from public.couples c where c.id = p_couple
$$;

-- Has the current user answered the prompt with this key? Gates the blind reveal server-side.
create or replace function public.has_answered(p_couple uuid, p_key text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.entries e
    where e.couple_id = p_couple and e.kind = 'answer' and not e.deleted
      and e.data->>'promptKey' = p_key and e.author_uid = auth.uid()
  )
$$;

create or replace function public.entries_stamp()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    new.author_uid := auth.uid();
    new.author := public.couple_role(new.couple_id);
    if new.author is null then
      raise exception 'not a member of this couple';
    end if;
    new.created_at := now();
  else
    -- Authorship and kind never change after creation.
    new.author_uid := old.author_uid;
    new.author := old.author;
    new.kind := old.kind;
    new.created_at := old.created_at;
  end if;
  new.updated_at := now();
  return new;
end $$;

create trigger entries_stamp before insert or update on public.entries
  for each row execute function public.entries_stamp();

-- ---------- Pairing RPCs ----------

create or replace function public.create_couple()
returns table (couple_id uuid, code text)
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare
  v_code text;
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  loop
    v_code := lpad(((('x' || encode(extensions.gen_random_bytes(4), 'hex'))::bit(32)::bigint) % 1000000)::text, 6, '0');
    exit when not exists (select 1 from public.couples c where c.code = v_code);
  end loop;
  insert into public.couples (code, code_expires_at, member_a)
    values (v_code, now() + interval '24 hours', auth.uid())
    returning id into v_id;
  return query select v_id, v_code;
end $$;

create or replace function public.join_couple(p_code text)
returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  -- Basic brute-force guard: 10 attempts per user per hour.
  if (select count(*) from public.pair_attempts a
      where a.uid = auth.uid() and a.at > now() - interval '1 hour') >= 10 then
    raise exception 'too many attempts, try again later';
  end if;
  insert into public.pair_attempts (uid) values (auth.uid());

  update public.couples c
     set member_b = auth.uid(), code = null, code_expires_at = null
   where c.code = p_code
     and c.code_expires_at > now()
     and c.member_b is null
     and c.member_a <> auth.uid()
  returning c.id into v_id;

  -- Return null rather than raising, so the attempt row above is kept and counts toward the limit.
  return v_id;
end $$;

-- ---------- Row level security ----------

alter table public.couples enable row level security;
alter table public.entries enable row level security;
alter table public.pair_attempts enable row level security;  -- no policies: only the RPCs touch it

create policy couples_select on public.couples for select to authenticated
  using (member_a = auth.uid() or member_b = auth.uid());

create policy entries_select on public.entries for select to authenticated
  using (
    public.couple_role(couple_id) is not null
    and (kind <> 'answer' or author_uid = auth.uid() or public.has_answered(couple_id, data->>'promptKey'))
  );

create policy entries_insert on public.entries for insert to authenticated
  with check (public.couple_role(couple_id) is not null);

-- Shared things (bucket items, the current prompt and challenge) can be edited by either
-- partner; personal things (answers, vibes, notes, check-ins, challenge progress) only by their author.
create policy entries_update on public.entries for update to authenticated
  using (
    public.couple_role(couple_id) is not null
    and (kind not in ('answer','answered','vibe','challenge_progress','note','checkin') or author_uid = auth.uid())
  )
  with check (public.couple_role(couple_id) is not null);

-- ---------- Grants ----------

revoke all on function public.create_couple() from public, anon;
revoke all on function public.join_couple(text) from public, anon;
grant execute on function public.create_couple() to authenticated;
grant execute on function public.join_couple(text) to authenticated;
grant execute on function public.couple_role(uuid) to authenticated;
grant execute on function public.has_answered(uuid, text) to authenticated;

-- ---------- Realtime ----------

alter publication supabase_realtime add table public.entries, public.couples;
