-- Product name no longer needs manual entry - a type's name (e.g.
-- "Kalamkari Cotton Sarees") already describes the product well enough,
-- so typing a near-identical name per product was pure busywork. Derive
-- it automatically from the selected product type instead. The name
-- column itself is untouched (still shown everywhere, still searchable).

drop function if exists create_product(uuid, text, int, boolean, text);

create or replace function create_product(
  p_type_id        uuid,
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
  v_row  products;
  v_name text;
begin
  if p_quantity < 0 then
    raise exception 'quantity cannot be negative';
  end if;
  if p_print_type is not null and p_print_type not in ('screen', 'block') then
    raise exception 'invalid print type: %', p_print_type;
  end if;

  select name into v_name from product_types where id = p_type_id;
  if v_name is null then
    raise exception 'invalid product type: %', p_type_id;
  end if;

  insert into products (type_id, product_code, name, quantity, is_multi_color, print_type)
  values (
    p_type_id,
    generate_product_code(p_type_id),
    v_name,
    p_quantity,
    p_is_multi_color,
    p_print_type
  )
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function create_product(uuid, int, boolean, text) to authenticated;
