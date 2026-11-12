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
  for select using ((select auth.uid()) = user_id);
create policy "progress: criar o próprio" on public.progress
  for insert with check ((select auth.uid()) = user_id);
create policy "progress: alterar o próprio" on public.progress
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Atualização em tempo real entre dispositivos (opcional, mas recomendado).
alter publication supabase_realtime add table public.progress;

-- ---------------------------------------------------------------------------------------------
-- Perfis: nome de usuário único e aparência do avatar (migração profiles_username_avatar).

create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  username text not null check (username ~ '^[A-Za-z0-9_]{3,20}$'),
  avatar jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Único sem diferenciar maiúsculas: "Ewerton" e "ewerton" são o mesmo nome.
create unique index if not exists profiles_username_lower_key on public.profiles (lower(username));

alter table public.profiles enable row level security;

-- Quem está logado enxerga nome e avatar dos outros (base para um ranking futuro); só altera o próprio.
create policy "profiles: logados leem" on public.profiles
  for select to authenticated using (true);
create policy "profiles: criar o próprio" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "profiles: alterar o próprio" on public.profiles
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

revoke all on public.profiles from anon;

-- Cria o perfil junto com a conta. O nome vem do cadastro (raw_user_meta_data.username);
-- se faltar ou for inválido, usa um provisório que a pessoa troca depois.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  wanted text := new.raw_user_meta_data ->> 'username';
begin
  if wanted is null or wanted !~ '^[A-Za-z0-9_]{3,20}$' then
    wanted := 'user_' || substr(replace(new.id::text, '-', ''), 1, 10);
  end if;
  insert into public.profiles (user_id, username) values (new.id, wanted);
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Consulta usada no formulário de cadastro, antes de existir sessão: o nome está livre?
-- É de propósito que qualquer pessoa pode chamá-la (o linter do Supabase avisa; é esperado).
create or replace function public.username_available(name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select name ~ '^[A-Za-z0-9_]{3,20}$'
    and not exists (select 1 from public.profiles p where lower(p.username) = lower(name));
$$;

revoke all on function public.username_available(text) from public;
grant execute on function public.username_available(text) to anon, authenticated;
