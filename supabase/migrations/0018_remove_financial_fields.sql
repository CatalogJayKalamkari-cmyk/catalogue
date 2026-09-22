-- The app no longer tracks or shows selling/acquired price, revenue, or
-- profit anywhere - it's a pure product catalog now. Per product decision,
-- the existing price_selling/price_acquired columns and the
-- stock_transactions table are left in place (not dropped) so no
-- historical data is lost. This migration only adapts the write surface so
-- the app can keep working without ever sending price data again, and lets
-- quantity be edited directly as a plain field instead of through the old
-- sell/restock transaction flow.

-- price_selling/price_acquired are no longer supplied by the app - give
-- them a default so create_product can omit them (they stay NOT NULL).
alter table products alter column price_selling set default 0;
alter table products alter column price_acquired set default 0;

-- create_product drops its price parameters entirely - signature changes,
-- so drop the old overload first.
drop function if exists create_product(uuid, text, numeric, numeric, int, boolean, text);

create or replace function create_product(
  p_type_id        uuid,
  p_name           text,
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

  insert into products (type_id, product_code, name, quantity, is_multi_color, print_type)
  values (
    p_type_id,
    generate_product_code(p_type_id),
    trim(p_name),
    p_quantity,
    p_is_multi_color,
    p_print_type
  )
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function create_product(uuid, text, int, boolean, text) to authenticated;

-- Quantity is now edited directly as a plain product field (single-color
-- products only - multi-color totals stay derived from per-photo
-- quantities via the existing trigger), so grant it like any other
-- editable column. price_selling/price_acquired are revoked since the app
-- never writes them again.
revoke update (price_selling, price_acquired) on products from authenticated;
grant update (quantity) on products to authenticated;

-- Public catalog view no longer reads price_selling. While rebuilding it,
-- also fix a pre-existing gap where anon was never granted column access
-- for is_multi_color/print_type (added in later migrations after the
-- original anon grant), even though the view already exposed them.
create or replace view products_public as
select
  id, product_code, name, type_id, quantity,
  (quantity > 0) as in_stock, created_at, is_multi_color, print_type
from products
where is_active = true;

alter view products_public set (security_invoker = true);

revoke select (price_selling) on products from anon;
grant select (id, product_code, name, type_id, quantity, is_active, created_at, is_multi_color, print_type)
  on products to anon;
