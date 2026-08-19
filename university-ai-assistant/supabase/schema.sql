-- ============================================================
-- University AI Assistant — Supabase Schema
-- Run this in the Supabase SQL editor (or via `supabase db push`)
-- ============================================================

-- 1. Extensions ------------------------------------------------
create extension if not exists vector;
create extension if not exists pgcrypto;

-- 2. courses -----------------------------------------------------
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- 3. students ------------------------------------------------------
create table if not exists public.students (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  academic_id text not null unique,
  created_at timestamptz not null default now()
);

-- 4. documents (chunks + embeddings) --------------------------------
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  embedding vector(768),
  file_name text not null,
  chunk_id int not null,
  course_id uuid references public.courses (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists documents_embedding_idx
  on public.documents using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create index if not exists documents_course_id_idx
  on public.documents (course_id);

-- 5. chat_logs -------------------------------------------------------
create table if not exists public.chat_logs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.students (id) on delete cascade,
  question text not null,
  answer text,
  course_id uuid references public.courses (id),
  created_at timestamptz not null default now()
);

-- 6. match_documents() — vector similarity search (pgvector) ---------
create or replace function public.match_documents (
  query_embedding vector(768),
  match_count int default 5,
  filter_course_id uuid default null
)
returns table (
  id uuid,
  content text,
  file_name text,
  chunk_id int,
  course_id uuid,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    d.id,
    d.content,
    d.file_name,
    d.chunk_id,
    d.course_id,
    1 - (d.embedding <=> query_embedding) as similarity
  from public.documents d
  where filter_course_id is null or d.course_id = filter_course_id
  order by d.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- 7. Row Level Security -----------------------------------------------
alter table public.students enable row level security;
alter table public.chat_logs enable row level security;
alter table public.documents enable row level security;
alter table public.courses enable row level security;

-- Students can read/update only their own row
create policy "students_select_own" on public.students
  for select using (auth.uid() = id);
create policy "students_update_own" on public.students
  for update using (auth.uid() = id);
create policy "students_insert_own" on public.students
  for insert with check (auth.uid() = id);

-- Chat logs: students can only see/insert their own
create policy "chat_logs_select_own" on public.chat_logs
  for select using (auth.uid() = student_id);
create policy "chat_logs_insert_own" on public.chat_logs
  for insert with check (auth.uid() = student_id);

-- Courses & documents: readable by any authenticated user
create policy "courses_select_authenticated" on public.courses
  for select using (auth.role() = 'authenticated');
create policy "documents_select_authenticated" on public.documents
  for select using (auth.role() = 'authenticated');

-- NOTE: writes to documents/courses are done exclusively via the backend
-- using the SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS. No public
-- insert/update/delete policies are defined for these tables on purpose.
