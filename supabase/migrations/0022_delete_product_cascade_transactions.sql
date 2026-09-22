-- 0021's delete_product() correctly hit stock_transactions' `on delete
-- restrict` FK for any product with sale history from before this app
-- dropped the sell/restock flow (e.g. real products created before this
-- session's cleanup). That historical revenue data has no purpose once
-- the product itself is gone and nothing in the app reads it any more -
-- delete it alongside the product instead of blocking the delete.

create or replace function delete_product(p_product_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from stock_transactions where product_id = p_product_id;
  delete from products where id = p_product_id;
end;
$$;
