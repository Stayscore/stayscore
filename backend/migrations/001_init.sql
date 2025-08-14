create table if not exists app_user(
  id bigserial primary key,
  role text check (role in ('guest','venue','admin')) not null,
  email text unique,
  username text unique,
  password_hash text,
  consent_privacy boolean default false,
  created_at timestamptz default now()
);
create table if not exists venue(
  id bigserial primary key,
  name text not null,
  city text,
  country text,
  verification_status text default 'pending',
  created_by bigint references app_user(id),
  created_at timestamptz default now()
);
create table if not exists stay(
  id bigserial primary key,
  venue_id bigint references venue(id) on delete cascade,
  guest_id bigint references app_user(id) on delete set null,
  checkin_date date,
  checkout_date date,
  source text,
  status text default 'created',
  created_at timestamptz default now()
);
create table if not exists rating(
  id bigserial primary key,
  stay_id bigint references stay(id) on delete cascade,
  stars int check (stars between 1 and 5) not null,
  comment text,
  is_public boolean default true,
  created_by bigint references app_user(id),
  created_at timestamptz default now()
);
create table if not exists reply(
  id bigserial primary key,
  rating_id bigint references rating(id) on delete cascade,
  venue_id bigint references venue(id) on delete cascade,
  message text not null,
  created_at timestamptz default now()
);
create table if not exists promotion(
  id bigserial primary key,
  venue_id bigint references venue(id) on delete cascade,
  title text not null,
  min_stars int default 4,
  code text unique not null,
  valid_from date,
  valid_to date,
  active boolean default true,
  created_at timestamptz default now()
);
