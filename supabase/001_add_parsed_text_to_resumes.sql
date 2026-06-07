alter table public.resumes
add column if not exists parsed_text text not null default '';
