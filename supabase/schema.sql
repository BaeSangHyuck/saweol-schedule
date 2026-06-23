create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order int not null default 0
);

create table if not exists gms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order int not null default 0
);

create table if not exists settings (
  id int primary key default 1,
  open_time text not null default '08:00',
  close_time text not null default '23:00',
  slot_minutes int not null default 30,
  constraint settings_singleton check (id = 1)
);

create table if not exists shows (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  color text not null,
  capacity int,
  default_play_minutes int,
  resource_link text,
  created_at timestamptz not null default now()
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  show_id uuid not null references shows(id) on delete cascade,
  room_id uuid not null references rooms(id) on delete cascade,
  date date not null,
  start_time text not null,
  duration_minutes int not null,
  gm_name text,
  gm_id uuid references gms(id) on delete set null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists audiences (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  name text not null,
  memo text,
  payment_status text,
  created_at timestamptz not null default now()
);

-- 기존 DB 마이그레이션용 (이미 테이블이 있는 경우)
alter table bookings add column if not exists gm_id uuid references gms(id) on delete set null;
alter table bookings add column if not exists description text;
alter table audiences add column if not exists payment_status text;

-- seed
insert into settings (id) values (1) on conflict (id) do nothing;
insert into rooms (name, sort_order) values ('101호',0),('102호',1),('103호',2)
  on conflict do nothing;
