-- 0001 init financial schema
create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  type text not null default 'CHECKING' check (type in ('CHECKING','SAVINGS','CASH','INVESTMENT')),
  initial_balance numeric(14,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('INCOME','EXPENSE')),
  color text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name, type)
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  account_id uuid not null references accounts(id) on delete restrict,
  category_id uuid not null references categories(id) on delete restrict,
  type text not null check (type in ('INCOME','EXPENSE')),
  amount numeric(14,2) not null,
  description text,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists transfers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  from_account_id uuid not null references accounts(id) on delete restrict,
  to_account_id uuid not null references accounts(id) on delete restrict,
  amount numeric(14,2) not null,
  description text,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (from_account_id <> to_account_id)
);

create table if not exists cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  account_id uuid references accounts(id) on delete set null,
  name text not null,
  type text not null default 'CREDIT' check (type in ('CREDIT','DEBIT')),
  last_four_digits text,
  limit_amount numeric(14,2),
  due_day integer,
  closing_day integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  target_amount numeric(14,2) not null,
  current_amount numeric(14,2) not null default 0,
  target_date timestamptz,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','COMPLETED','CANCELED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_accounts_user_id on accounts(user_id);
create index if not exists idx_categories_user_id on categories(user_id);
create index if not exists idx_transactions_user_id_occurred_at on transactions(user_id, occurred_at);
create index if not exists idx_transactions_user_id_type_occurred_at on transactions(user_id, type, occurred_at);
create index if not exists idx_transfers_user_id_occurred_at on transfers(user_id, occurred_at);
create index if not exists idx_cards_user_id on cards(user_id);
create index if not exists idx_goals_user_id_status on goals(user_id, status);