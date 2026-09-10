-- Server-side business logic: product code generation and stock deduction.
-- These run as SECURITY DEFINER so the admin client can call them via RPC
-- without needing direct INSERT/UPDATE grants on the underlying tables.

create or replace function generate_product_code(p_type_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prefix text;
  v_seq    int;
begin
  select prefix, next_seq into v_prefix, v_seq
    from product_types
    where id = p_type_id
    for update;

  if v_prefix is null then
    raise exception 'invalid product type: %', p_type_id;
  end if;

  update product_types set next_seq = v_seq + 1 where id = p_type_id;

  return v_prefix || '-' || lpad(v_seq::text, 3, '0');
end;
$$;

create or replace function create_product(
  p_type_id        uuid,
  p_name           text,
  p_price_selling  numeric,
  p_price_acquired numeric,
  p_quantity       int
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

  insert into products (type_id, product_code, name, price_selling, price_acquired, quantity)
  values (
    p_type_id,
    generate_product_code(p_type_id),
    trim(p_name),
    p_price_selling,
    p_price_acquired,
    p_quantity
  )
  returning * into v_row;

  return v_row;
end;
$$;

create or replace function record_sale(p_product_id uuid, p_quantity int)
returns stock_transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_qty   int;
  v_price numeric;
  v_tx    stock_transactions;
begin
  if p_quantity is null or p_quantity <= 0 then
    raise exception 'quantity must be positive';
  end if;

  select quantity, price_selling into v_qty, v_price
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
  values (p_product_id, p_quantity, v_price, p_quantity * v_price)
  returning * into v_tx;

  return v_tx;
end;
$$;

create or replace function create_product_type(p_name text, p_prefix text)
returns product_types
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row product_types;
begin
  insert into product_types (name, prefix)
  values (trim(p_name), upper(trim(p_prefix)))
  returning * into v_row;
  return v_row;
end;
$$;
