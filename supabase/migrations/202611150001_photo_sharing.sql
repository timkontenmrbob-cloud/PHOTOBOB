-- Private images: only the server function may manage files or session records.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photobox-photos', 'photobox-photos', false, 2097152, array['image/jpeg'])
on conflict (id) do update set public = false, file_size_limit = 2097152, allowed_mime_types = array['image/jpeg'];

create table if not exists public.photobox_shares (
  token_hash text primary key check (token_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  ready boolean not null default false,
  deleted_at timestamptz
);
alter table public.photobox_shares enable row level security;
revoke all on public.photobox_shares from anon, authenticated;
grant all on public.photobox_shares to service_role;
create index if not exists photobox_shares_cleanup on public.photobox_shares (expires_at) where deleted_at is null;
-- No public Storage policies: uploads/downloads use narrowly scoped signed URLs.
