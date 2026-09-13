-- Lets the admin add stock back to an existing product (e.g. re-acquiring
-- the same design after selling out) without creating a duplicate product
-- row. Mirrors record_sale()'s shape but adds instead of subtracts.

create or replace function restock_product(p_product_id uuid, p_quantity int)
returns products
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row products;
begin
  if p_quantity is null or p_quantity <= 0 then
    raise exception 'quantity must be positive';
  end if;

  update products
    set quantity = quantity + p_quantity
    where id = p_product_id
  returning * into v_row;

  if v_row is null then
    raise exception 'product not found';
  end if;

  return v_row;
end;
$$;

grant execute on function restock_product(uuid, int) to authenticated;
