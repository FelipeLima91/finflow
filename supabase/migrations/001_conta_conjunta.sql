-- FinFlow — Conta conjunta (household) + autoria dos lançamentos
--
-- Rode no SQL Editor do Supabase. É IDEMPOTENTE e ADITIVO:
-- pode rodar mais de uma vez e não apaga nenhum dado existente.

-- 1. PROFILES ----------------------------------------------------------------
-- O client não consegue ler auth.users direto, então espelhamos no schema
-- public. É esta tabela que permite mostrar "quem lançou".
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  email        text,
  display_name text,
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Cria o profile automaticamente quando alguém se cadastra
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill de quem já existe
insert into public.profiles (id, email, display_name)
select u.id, u.email, split_part(u.email, '@', 1)
from auth.users u
on conflict (id) do nothing;

-- 2. HOUSEHOLDS (a conta conjunta) -------------------------------------------
create table if not exists public.households (
  id         uuid primary key default gen_random_uuid(),
  name       text not null default 'Nossa conta',
  created_at timestamptz not null default now()
);

create table if not exists public.household_members (
  household_id uuid not null references public.households (id) on delete cascade,
  user_id      uuid not null references auth.users (id) on delete cascade,
  role         text not null default 'member',
  created_at   timestamptz not null default now(),
  primary key (household_id, user_id)
);

alter table public.households        enable row level security;
alter table public.household_members enable row level security;

-- Helper SECURITY DEFINER: retorna a household do usuário logado.
-- Precisa ser SECURITY DEFINER para NÃO disparar a RLS de household_members
-- de novo (senão vira recursão infinita — pegadinha clássica do Supabase).
create or replace function public.current_household_id()
returns uuid language sql stable security definer set search_path = public as $$
  select household_id
  from public.household_members
  where user_id = auth.uid()
  limit 1;
$$;

-- 3. transactions.household_id -----------------------------------------------
alter table public.transactions
  add column if not exists household_id uuid references public.households (id) on delete cascade;

-- 4. BACKFILL: cria UMA household e joga todo mundo + tudo que já existe nela
do $$
declare hh uuid;
begin
  select id into hh from public.households order by created_at limit 1;

  if hh is null then
    insert into public.households (name) values ('Nossa conta') returning id into hh;
  end if;

  insert into public.household_members (household_id, user_id, role)
  select hh, u.id, 'owner' from auth.users u
  on conflict do nothing;

  update public.transactions set household_id = hh where household_id is null;
end $$;

-- 5. DEFAULTS: o app nem precisa mandar esses campos no insert ---------------
alter table public.transactions alter column household_id set default public.current_household_id();
alter table public.transactions alter column user_id      set default auth.uid();

-- FK extra para o PostgREST conseguir embutir o autor no select
alter table public.transactions drop constraint if exists transactions_author_fkey;
alter table public.transactions
  add constraint transactions_author_fkey
  foreign key (user_id) references public.profiles (id) on delete cascade;

-- 6. RLS: "sou dono da linha" -> "sou membro desta household" ----------------
drop policy if exists "select_own_transactions" on public.transactions;
drop policy if exists "insert_own_transactions" on public.transactions;
drop policy if exists "update_own_transactions" on public.transactions;
drop policy if exists "delete_own_transactions" on public.transactions;

drop policy if exists "household_select" on public.transactions;
create policy "household_select" on public.transactions for select
  using (household_id = public.current_household_id());

drop policy if exists "household_insert" on public.transactions;
create policy "household_insert" on public.transactions for insert
  with check (household_id = public.current_household_id() and user_id = auth.uid());

drop policy if exists "household_update" on public.transactions;
create policy "household_update" on public.transactions for update
  using (household_id = public.current_household_id())
  with check (household_id = public.current_household_id());

drop policy if exists "household_delete" on public.transactions;
create policy "household_delete" on public.transactions for delete
  using (household_id = public.current_household_id());

-- Vejo o profile de quem é da minha household (pra exibir o nome do autor)
drop policy if exists "profiles_select_household" on public.profiles;
create policy "profiles_select_household" on public.profiles for select
  using (
    id = auth.uid()
    or id in (
      select user_id from public.household_members
      where household_id = public.current_household_id()
    )
  );

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "households_select" on public.households;
create policy "households_select" on public.households for select
  using (id = public.current_household_id());

drop policy if exists "members_select" on public.household_members;
create policy "members_select" on public.household_members for select
  using (household_id = public.current_household_id());
