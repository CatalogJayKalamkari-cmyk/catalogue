-- Track the quantity originally entered for each color at creation time
-- (never changes afterward) alongside the live `quantity`, so the admin
-- can see both "how many I started with" and "how many are left".
alter table product_images add column initial_quantity integer not null default 1;
update product_images set initial_quantity = quantity;

-- Acquire (restock) a specific color by an arbitrary amount, mirroring
-- sell_photo()'s shape but adding instead of subtracting. Does not touch
-- stock_transactions since acquiring isn't a sale.
create or replace function acquire_photo(p_image_id uuid, p_quantity int)
returns product_images
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row product_images;
begin
  if p_quantity is null or p_quantity <= 0 then
    raise exception 'quantity must be positive';
  end if;

  update product_images
    set quantity = quantity + p_quantity
    where id = p_image_id
  returning * into v_row;

  if v_row is null then
    raise exception 'photo not found';
  end if;

  return v_row;
end;
$$;

grant execute on function acquire_photo(uuid, int) to authenticated;
