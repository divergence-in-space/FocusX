-- Habit Tracker Database Schema
-- Paste this entire script into your new Supabase project's SQL Editor and click "Run".

-- 1. Create Tables
CREATE TABLE public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  name text,
  level integer not null default 1,
  xp integer not null default 0,
  created_at timestamp with time zone not null default now()
);

CREATE TABLE public.calendar_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  event_date date not null,
  start_time time without time zone,
  end_time time without time zone,
  event_type text,
  color text,
  reminder boolean default false,
  created_at timestamp with time zone not null default now()
);

CREATE TABLE public.expenses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  amount numeric not null,
  category text not null,
  note text,
  date date not null default current_date,
  created_at timestamp with time zone not null default now()
);

CREATE TABLE public.habits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  target text,
  created_at timestamp with time zone not null default now()
);

CREATE TABLE public.habit_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  habit_id uuid references public.habits(id) on delete cascade not null,
  date date not null default current_date,
  completed boolean not null default false
);

CREATE TABLE public.moods (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  mood_level text not null,
  reasons text[],
  date date not null default current_date,
  created_at timestamp with time zone not null default now()
);

CREATE TABLE public.notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  content text,
  category text,
  tags text[],
  pinned boolean default false,
  date date,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

CREATE TABLE public.sleep_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  date date not null default current_date,
  sleep_time timestamp with time zone not null,
  wake_time timestamp with time zone not null,
  quality integer not null,
  created_at timestamp with time zone not null default now()
);

CREATE TABLE public.study_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  subject text not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  focus_score integer not null default 0,
  notes text,
  date date not null default current_date,
  created_at timestamp with time zone not null default now()
);

CREATE TABLE public.workouts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  workout_type text not null,
  duration integer not null,
  calories integer,
  exercises text,
  date date not null default current_date,
  created_at timestamp with time zone not null default now()
);

-- 2. Turn on Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies (Allow users to manage only their own data)
CREATE POLICY "Users can manage their own profiles" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage their own calendar_events" ON public.calendar_events FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own expenses" ON public.expenses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own habits" ON public.habits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own habit_logs" ON public.habit_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own moods" ON public.moods FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own notes" ON public.notes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own sleep_logs" ON public.sleep_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own study_sessions" ON public.study_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own workouts" ON public.workouts FOR ALL USING (auth.uid() = user_id);

-- 4. Automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, level, xp)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 1, 0);
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Done! Your database is now ready.
