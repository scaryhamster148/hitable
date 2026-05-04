-- Schools (cached from NEIS)
create table if not exists schools (
  id uuid default gen_random_uuid() primary key,
  neis_code text unique not null,
  office_code text not null,
  name text not null,
  address text,
  created_at timestamptz default now()
);

-- Subjects (fetched from NEIS, cached per school)
create table if not exists subjects (
  id uuid default gen_random_uuid() primary key,
  school_id uuid references schools(id) on delete cascade,
  grade int not null check (grade in (1, 2, 3)),
  subject_name text not null,
  subject_category text,
  classroom text,
  is_mobile boolean default false,
  created_at timestamptz default now(),
  unique(school_id, grade, subject_name)
);

-- User profiles
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  school_id uuid references schools(id),
  grade int check (grade in (1, 2, 3)),
  class_num int,
  nickname text,
  created_at timestamptz default now()
);

-- User subject cart (수업함)
create table if not exists user_subjects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  subject_id uuid references subjects(id) on delete cascade,
  custom_classroom text,
  created_at timestamptz default now(),
  unique(user_id, subject_id)
);

-- Timetable slots
create table if not exists timetable_slots (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  day_of_week int not null check (day_of_week between 1 and 5),
  period int not null check (period between 1 and 7),
  user_subject_id uuid references user_subjects(id) on delete set null,
  created_at timestamptz default now(),
  unique(user_id, day_of_week, period)
);

-- Class reviews
create table if not exists class_reviews (
  id uuid default gen_random_uuid() primary key,
  subject_id uuid references subjects(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  rating int check (rating between 1 and 5),
  content text not null,
  created_at timestamptz default now()
);

-- Exam info
create table if not exists exam_info (
  id uuid default gen_random_uuid() primary key,
  subject_id uuid references subjects(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  content text,
  exam_date date,
  created_at timestamptz default now()
);

-- Chat messages
create table if not exists chat_messages (
  id uuid default gen_random_uuid() primary key,
  subject_id uuid references subjects(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  message text not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table schools enable row level security;
alter table subjects enable row level security;
alter table profiles enable row level security;
alter table user_subjects enable row level security;
alter table timetable_slots enable row level security;
alter table class_reviews enable row level security;
alter table exam_info enable row level security;
alter table chat_messages enable row level security;

-- Schools: anyone can read/insert (for caching NEIS data)
create policy "Schools viewable by all" on schools for select using (true);
create policy "Schools insertable by authenticated" on schools for insert with check (auth.role() = 'authenticated');

-- Subjects: anyone can read/insert
create policy "Subjects viewable by all" on subjects for select using (true);
create policy "Subjects insertable by authenticated" on subjects for insert with check (auth.role() = 'authenticated');
create policy "Subjects updatable by authenticated" on subjects for update using (auth.role() = 'authenticated');

-- Profiles
create policy "Users view own profile" on profiles for select using (auth.uid() = id);
create policy "Users insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);

-- User subjects
create policy "Users manage own cart" on user_subjects for all using (auth.uid() = user_id);

-- Timetable slots
create policy "Users manage own timetable" on timetable_slots for all using (auth.uid() = user_id);

-- Reviews: all authenticated can read, own can write
create policy "Reviews readable by authenticated" on class_reviews for select using (auth.role() = 'authenticated');
create policy "Users manage own reviews" on class_reviews for all using (auth.uid() = user_id);

-- Exam info
create policy "Exams readable by authenticated" on exam_info for select using (auth.role() = 'authenticated');
create policy "Users manage own exam info" on exam_info for all using (auth.uid() = user_id);

-- Chat messages
create policy "Chat readable by authenticated" on chat_messages for select using (auth.role() = 'authenticated');
create policy "Users send messages" on chat_messages for insert with check (auth.uid() = user_id);

-- Enable Realtime for chat
alter publication supabase_realtime add table chat_messages;
