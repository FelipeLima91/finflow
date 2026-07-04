-- FinFlow — schema do banco (Supabase / Postgres)
-- Rode no SQL Editor de um projeto Supabase novo para recriar a estrutura.
-- Baseado no uso em services/transactionService.ts e types/index.ts.

-- Tabela de transações -------------------------------------------------------
create table if not exists public.transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  description text not null,
  amount      numeric(12,2) not null,
  type        text not null check (type in ('income', 'expense')),
  category    text not null,
  date        timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

-- Consultas por usuário ordenadas por data (getAll usa order by date desc)
create index if not exists transactions_user_date_idx
  on public.transactions (user_id, date desc);

-- Row Level Security: cada usuário só enxerga/mexe nas próprias transações ----
-- (o app faz select("*") sem filtrar por user_id e confia na RLS)
alter table public.transactions enable row level security;

create policy "select_own_transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "insert_own_transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "update_own_transactions"
  on public.transactions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "delete_own_transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);
