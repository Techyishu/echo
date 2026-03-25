-- InterviewReady AI — Supabase Schema
-- Run this in your Supabase SQL Editor (https://app.supabase.com → SQL Editor)

-- Sessions table: one row per job analysis
create table if not exists sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  job_url text not null,
  job_title text,
  company_name text,
  company_description text,
  required_skills jsonb,
  responsibilities jsonb,
  raw_scrape jsonb,
  elevenlabs_conversation_id text,
  created_at timestamptz default now()
);

-- Questions table: 10 generated questions per session
create table if not exists questions (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references sessions(id) on delete cascade not null,
  question_text text not null,
  question_type text check (question_type in ('behavioral', 'technical', 'culture_fit')),
  order_index integer not null,
  created_at timestamptz default now()
);

-- Feedback table: per-answer feedback + overall summary
create table if not exists feedback (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references sessions(id) on delete cascade not null,
  question_id uuid references questions(id) on delete cascade,
  score integer check (score >= 0 and score <= 10),
  did_well text,
  improve text,
  sample_answer text,
  overall_score integer check (overall_score >= 0 and overall_score <= 10),
  recommendations jsonb,
  created_at timestamptz default now()
);

-- Row Level Security: users can only see their own data
alter table sessions enable row level security;
alter table questions enable row level security;
alter table feedback enable row level security;

create policy "Users can manage their own sessions"
  on sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can view questions for their sessions"
  on questions for all
  using (
    exists (
      select 1 from sessions
      where sessions.id = questions.session_id
      and sessions.user_id = auth.uid()
    )
  );

create policy "Users can view feedback for their sessions"
  on feedback for all
  using (
    exists (
      select 1 from sessions
      where sessions.id = feedback.session_id
      and sessions.user_id = auth.uid()
    )
  );
