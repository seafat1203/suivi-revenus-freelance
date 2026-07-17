create table if not exists public.monthly_income_records (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  month text not null,
  work_days numeric not null default 0,
  tjm numeric not null,
  french_salary numeric,
  uk_bonus numeric,
  other_reimbursement numeric,
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, month)
);

create table if not exists public.income_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  default_tjm numeric not null default 510,
  management_fee_rate numeric not null default 0.07,
  meal_card_daily_amount numeric not null default 13,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.monthly_income_records enable row level security;
alter table public.income_settings enable row level security;

drop policy if exists "Users can read their monthly records" on public.monthly_income_records;
create policy "Users can read their monthly records"
on public.monthly_income_records
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their monthly records" on public.monthly_income_records;
create policy "Users can insert their monthly records"
on public.monthly_income_records
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their monthly records" on public.monthly_income_records;
create policy "Users can update their monthly records"
on public.monthly_income_records
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their monthly records" on public.monthly_income_records;
create policy "Users can delete their monthly records"
on public.monthly_income_records
for delete
using (auth.uid() = user_id);

drop policy if exists "Users can read their settings" on public.income_settings;
create policy "Users can read their settings"
on public.income_settings
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their settings" on public.income_settings;
create policy "Users can insert their settings"
on public.income_settings
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their settings" on public.income_settings;
create policy "Users can update their settings"
on public.income_settings
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
