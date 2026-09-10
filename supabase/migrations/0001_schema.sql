-- Core schema for the manufacturer catalog & inventory app.

create extension if not exists "pgcrypto";

create table product_types (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  prefix     text not null unique check (prefix ~ '^[A-Z0-9]{2,4}$'),
  next_seq   integer not null default 1,
  created_at timestamptz not null default now()
);

create table products (
  id             uuid primary key default gen_random_uuid(),
  type_id        uuid not null references product_types(id) on delete restrict,
  product_code   text not null unique,
  name           text not null,
  price_selling  numeric(12,2) not null check (price_selling >= 0),
  price_acquired numeric(12,2) not null check (price_acquired >= 0),
  quantity       integer not null default 0 check (quantity >= 0),
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index products_type_id_idx on products(type_id);
create index products_created_at_idx on products(created_at desc);

create table product_images (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references products(id) on delete cascade,
  storage_path text not null,
  sort_order   smallint not null default 0 check (sort_order between 0 and 2),
  created_at   timestamptz not null default now(),
  unique (product_id, sort_order)
);

create table stock_transactions (
  id                    uuid primary key default gen_random_uuid(),
  product_id            uuid not null references products(id) on delete restrict,
  quantity_sold         integer not null check (quantity_sold > 0),
  price_selling_at_sale numeric(12,2) not null,
  revenue               numeric(12,2) not null,
  created_by            uuid not null default auth.uid(),
  created_at            timestamptz not null default now()
);

create index stock_transactions_product_id_idx on stock_transactions(product_id);
create index stock_transactions_created_at_idx on stock_transactions(created_at desc);

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

create trigger products_set_updated_at
  before update on products
  for each row execute function set_updated_at();
