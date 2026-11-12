create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles readable" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- first account created becomes admin
create or replace function public.grant_first_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created_admin after insert on auth.users
for each row execute function public.grant_first_admin();

create table public.brokers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nome text not null,
  creci text not null default '',
  tel text not null default '',
  email text not null default '',
  foto_url text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.brokers to anon;
grant select, insert, update, delete on public.brokers to authenticated;
grant all on public.brokers to service_role;
alter table public.brokers enable row level security;
create policy "public reads active" on public.brokers for select to anon, authenticated using (ativo = true or public.has_role(auth.uid(), 'admin'));
create policy "admin insert" on public.brokers for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "admin update" on public.brokers for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admin delete" on public.brokers for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;
create trigger brokers_touch before update on public.brokers for each row execute function public.touch_updated_at();

insert into public.brokers (slug, nome, creci, tel, email) values
('luciano', 'Luciano Venize', '12345-DF', '61999999999', 'contato@venizeimoveis.com.br');

create policy "public read broker photos" on storage.objects for select using (bucket_id = 'broker-photos');
create policy "admin upload broker photos" on storage.objects for insert to authenticated with check (bucket_id = 'broker-photos' and public.has_role(auth.uid(), 'admin'));
create policy "admin update broker photos" on storage.objects for update to authenticated using (bucket_id = 'broker-photos' and public.has_role(auth.uid(), 'admin'));
create policy "admin delete broker photos" on storage.objects for delete to authenticated using (bucket_id = 'broker-photos' and public.has_role(auth.uid(), 'admin'));