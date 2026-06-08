alter table public.resumes
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

update storage.buckets
set public = false
where id = 'resumes';

create index if not exists resumes_user_id_idx on public.resumes(user_id);

alter table public.resumes enable row level security;

drop policy if exists "Users can view own resumes" on public.resumes;
drop policy if exists "Users can insert own resumes" on public.resumes;
drop policy if exists "Users can delete own resumes" on public.resumes;

create policy "Users can view own resumes"
on public.resumes
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own resumes"
on public.resumes
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can delete own resumes"
on public.resumes
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can read own resume files" on storage.objects;
drop policy if exists "Users can upload own resume files" on storage.objects;
drop policy if exists "Users can delete own resume files" on storage.objects;

create policy "Users can read own resume files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'resumes'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can upload own resume files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'resumes'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete own resume files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'resumes'
  and auth.uid()::text = (storage.foldername(name))[1]
);
