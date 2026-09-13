-- Screen-printed vs block-printed is a real quality/technique distinction
-- for Kalamkari goods, worth capturing per product and showing to
-- customers. Nullable since existing products predate this field.

alter table products add column print_type text check (print_type in ('screen', 'block'));

grant update (print_type) on products to authenticated;

-- Adding a parameter changes the signature, so CREATE OR REPLACE would
-- leave the old 6-arg version as a stale, unused overload - drop it first.
drop function if exists create_product(uuid, text, numeric, numeric, int, boolean);

create or replace function create_product(
  p_type_id        uuid,
  p_name           text,
  p_price_selling  numeric,
  p_price_acquired numeric,
  p_quantity       int,
  p_is_multi_color boolean default false,
  p_print_type     text default null
)
returns products
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row products;
begin
  if p_name is null or length(trim(p_name)) = 0 then
    raise exception 'name is required';
  end if;
  if p_quantity < 0 then
    raise exception 'quantity cannot be negative';
  end if;
  if p_print_type is not null and p_print_type not in ('screen', 'block') then
    raise exception 'invalid print type: %', p_print_type;
  end if;

  insert into products (type_id, product_code, name, price_selling, price_acquired, quantity, is_multi_color, print_type)
  values (
    p_type_id,
    generate_product_code(p_type_id),
    trim(p_name),
    p_price_selling,
    p_price_acquired,
    p_quantity,
    p_is_multi_color,
    p_print_type
  )
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function create_product(uuid, text, numeric, numeric, int, boolean, text) to authenticated;

create or replace view products_public as
select
  id, product_code, name, type_id, price_selling, quantity,
  (quantity > 0) as in_stock, created_at, is_multi_color, print_type
from products
where is_active = true;

alter view products_public set (security_invoker = true);
