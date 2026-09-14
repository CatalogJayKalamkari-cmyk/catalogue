-- Real sales often happen at a negotiated price, not the exact catalog
-- price_selling. record_sale() and sell_photo() always used the catalog
-- price, so stock_transactions.revenue (and therefore profit) never
-- reflected what the admin actually collected. Let the admin pass the
-- actual per-unit sale price; stock_transactions keeps storing it in
-- price_selling_at_sale / revenue exactly as before, but now it's the
-- real amount instead of an assumption.
--
-- Adding a parameter changes the signature, so CREATE OR REPLACE would
-- leave the old versions as stale, unused overloads - drop them first.

drop function if exists record_sale(uuid, int);
drop function if exists sell_photo(uuid, int);

create or replace function record_sale(p_product_id uuid, p_quantity int, p_price_selling numeric)
returns stock_transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_qty   int;
  v_tx    stock_transactions;
begin
  if p_quantity is null or p_quantity <= 0 then
    raise exception 'quantity must be positive';
  end if;
  if p_price_selling is null or p_price_selling < 0 then
    raise exception 'sale price cannot be negative';
  end if;

  select quantity into v_qty
    from products
    where id = p_product_id
    for update;

  if v_qty is null then
    raise exception 'product not found';
  end if;
  if v_qty < p_quantity then
    raise exception 'insufficient stock: have %, requested %', v_qty, p_quantity;
  end if;

  update products
    set quantity = quantity - p_quantity
    where id = p_product_id;

  insert into stock_transactions (product_id, quantity_sold, price_selling_at_sale, revenue)
  values (p_product_id, p_quantity, p_price_selling, p_quantity * p_price_selling)
  returning * into v_tx;

  return v_tx;
end;
$$;

create or replace function sell_photo(p_image_id uuid, p_quantity int, p_price_selling numeric)
returns product_images
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product_id uuid;
  v_current_qty int;
  v_row product_images;
begin
  if p_quantity is null or p_quantity <= 0 then
    raise exception 'quantity must be positive';
  end if;
  if p_price_selling is null or p_price_selling < 0 then
    raise exception 'sale price cannot be negative';
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

  insert into stock_transactions (product_id, quantity_sold, price_selling_at_sale, revenue)
  values (v_product_id, p_quantity, p_price_selling, p_quantity * p_price_selling);

  return v_row;
end;
$$;

grant execute on function record_sale(uuid, int, numeric) to authenticated;
grant execute on function sell_photo(uuid, int, numeric) to authenticated;

-- 0015/0016 found that Supabase auto-grants EXECUTE to anon (and public) on
-- every new function regardless of the ALTER DEFAULT PRIVILEGES set up
-- there - confirmed still true here: these two functions came back
-- executable by anon immediately after creation. Revoke explicitly.
revoke execute on function record_sale(uuid, int, numeric) from public;
revoke execute on function record_sale(uuid, int, numeric) from anon;
revoke execute on function sell_photo(uuid, int, numeric) from public;
revoke execute on function sell_photo(uuid, int, numeric) from anon;
