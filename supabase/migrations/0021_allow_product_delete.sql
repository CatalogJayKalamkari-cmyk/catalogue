-- There has never been a way to actually delete a product (only archive
-- it via is_active) - the admin needs real deletion, e.g. to clean up
-- bulk test data. product_images cascades automatically (on delete
-- cascade, 0001); stock_transactions references products with `on delete
-- restrict` (0001), so deleting a product with real sale history still
-- correctly fails loudly rather than silently orphaning/losing that
-- history - fine for now since nothing in the app creates new
-- stock_transactions rows any more.

create or replace function delete_product(p_product_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from products where id = p_product_id;
end;
$$;

revoke execute on function delete_product(uuid) from public, anon;
grant execute on function delete_product(uuid) to authenticated;
