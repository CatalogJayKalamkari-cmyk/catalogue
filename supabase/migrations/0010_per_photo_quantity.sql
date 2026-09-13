-- Per-color quantity tracking for multi-color products. Each photo gets
-- its own stock count; the parent product's `quantity` becomes a derived
-- total (kept in sync by trigger) for multi-color products only - single
-- products keep working exactly as before, with quantity set directly.
--
-- Supersedes the is_sold flag from 0005: with real per-photo quantity,
-- "sold out" is simply quantity = 0, so a separate boolean is redundant
-- and risks disagreeing with the actual count.

alter table products add column is_multi_color boolean not null default false;

alter table product_images add column quantity integer not null default 1 check (quantity >= 0);
alter table product_images drop column is_sold;

create or replace function sync_product_quantity_from_images()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product_id uuid;
  v_is_multi_color boolean;
begin
  v_product_id := coalesce(new.product_id, old.product_id);
  select is_multi_color into v_is_multi_color from products where id = v_product_id;

  if v_is_multi_color then
    update products
      set quantity = (select coalesce(sum(quantity), 0) from product_images where product_id = v_product_id)
      where id = v_product_id;
  end if;

  return null;
end;
$$;

create trigger product_images_sync_quantity
  after insert or update of quantity or delete on product_images
  for each row execute function sync_product_quantity_from_images();

-- create_product gains an is_multi_color flag (defaults false, so
-- existing callers are unaffected).
create or replace function create_product(
  p_type_id        uuid,
  p_name           text,
  p_price_selling  numeric,
  p_price_acquired numeric,
  p_quantity       int,
  p_is_multi_color boolean default false
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

  insert into products (type_id, product_code, name, price_selling, price_acquired, quantity, is_multi_color)
  values (
    p_type_id,
    generate_product_code(p_type_id),
    trim(p_name),
    p_price_selling,
    p_price_acquired,
    p_quantity,
    p_is_multi_color
  )
  returning * into v_row;

  return v_row;
end;
$$;

-- Sell a specific color/photo's stock - decrements that photo's quantity
-- (the trigger above rolls the new total up to the parent product) and
-- logs revenue in stock_transactions, same as record_sale() does for
-- single products.
create or replace function sell_photo(p_image_id uuid, p_quantity int)
returns product_images
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product_id uuid;
  v_current_qty int;
  v_price numeric;
  v_row product_images;
begin
  if p_quantity is null or p_quantity <= 0 then
    raise exception 'quantity must be positive';
  end if;

  select product_id, quantity into v_product_id, v_current_qty
    from product_images
    where id = p_image_id
    for update;

  if v_product_id is null then
    raise exception 'photo not found';
  end if;
  if v_current_qty < p_quantity then
    raise exception 'insufficient stock for this color: have %, requested %', v_current_qty, p_quantity;
  end if;

  update product_images
    set quantity = quantity - p_quantity
    where id = p_image_id
  returning * into v_row;

  select price_selling into v_price from products where id = v_product_id;

  insert into stock_transactions (product_id, quantity_sold, price_selling_at_sale, revenue)
  values (v_product_id, p_quantity, v_price, p_quantity * v_price);

  return v_row;
end;
$$;

grant execute on function create_product(uuid, text, numeric, numeric, int, boolean) to authenticated;
grant execute on function sell_photo(uuid, int) to authenticated;

-- Expose is_multi_color to the public catalog so the viewer knows whether
-- to show a photo's own quantity or the product's total.
create or replace view products_public as
select
  id, product_code, name, type_id, price_selling, quantity,
  (quantity > 0) as in_stock, created_at, is_multi_color
from products
where is_active = true;

alter view products_public set (security_invoker = true);
