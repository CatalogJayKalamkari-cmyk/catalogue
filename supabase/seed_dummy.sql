-- Dummy test data for manual QA — NOT part of the real catalog.
-- Run this once (in the Supabase SQL Editor) after the migrations and the
-- real supabase/seed.sql. Safe to delete these products from the app later.

insert into product_types (name, prefix) values
  ('Saree', 'SAR'),
  ('Dupatta', 'DUP')
on conflict (name) do nothing;

do $$
declare
  v_saree_type   uuid;
  v_dupatta_type uuid;
  v_general_type uuid;
begin
  select id into v_saree_type   from product_types where name = 'Saree';
  select id into v_dupatta_type from product_types where name = 'Dupatta';
  select id into v_general_type from product_types where name = 'General';

  perform create_product(v_saree_type,   12);
  perform create_product(v_saree_type,   20);
  perform create_product(v_dupatta_type, 30);
  perform create_product(v_dupatta_type, 15);
  perform create_product(v_general_type,  5);
  perform create_product(v_general_type,  0);
end $$;
