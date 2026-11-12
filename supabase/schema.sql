-- CSES Roadmap: sincronização do progresso.
-- Rode uma vez no SQL Editor do projeto Supabase.

create table if not exists public.progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

-- Cada pessoa só enxerga e altera a própria linha.
alter table public.progress enable row level security;

create policy "progress: ler o próprio" on public.progress
  for select using (auth.uid() = user_id);
create policy "progress: criar o próprio" on public.progress
  for insert with check (auth.uid() = user_id);
create policy "progress: alterar o próprio" on public.progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Atualização em tempo real entre dispositivos (opcional, mas recomendado).
alter publication supabase_realtime add table public.progress;
