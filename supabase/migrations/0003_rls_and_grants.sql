-- RLS + grants. Public (anon) gets read-only access to a curated view that
-- never exposes price_acquired. All writes happen through the SECURITY
-- DEFINER functions in 0002_functions.sql, or (for product_images / product
-- edits that don't touch quantity/product_code) through direct, narrowly
-- scoped grants to the authenticated role.
--
-- Note: this view intentionally does NOT use `security_invoker = true`.
-- The view is owned by the migration-running role, which (like any table
-- owner without FORCE ROW LEVEL SECURITY) bypasses RLS on `products` — so
-- the view's column list is what hides price_acquired, and anon never needs
-- any grant on the base `products` table at all.
create view products_public as
select
  id, product_code, name, type_id, price_selling, quantity,
  (quantity > 0) as in_stock, created_at
from products
where is_active = true;

grant usage on schema public to anon, authenticated;

-- Public catalog: read-only, via the view and the two non-sensitive tables.
grant select on products_public to anon, authenticated;
grant select on product_types to anon, authenticated;
grant select on product_images to anon, authenticated;
-- product_images carries no sensitive data, so the admin client manages rows
-- directly (insert after upload, delete on removal) rather than via an RPC.
grant insert, update, delete on product_images to authenticated;

-- Base products table: no anon access at all; authenticated can read
-- everything (including price_acquired) and can edit editable fields only —
-- quantity and product_code are deliberately excluded so stock can only
-- change via record_sale() and codes can only be minted via create_product().
grant select on products to authenticated;
grant update (name, price_selling, price_acquired, type_id, is_active) on products to authenticated;

grant select on stock_transactions to authenticated;

grant execute on function create_product(uuid, text, numeric, numeric, int) to authenticated;
grant execute on function record_sale(uuid, int) to authenticated;
grant execute on function create_product_type(text, text) to authenticated;

alter table product_types      enable row level security;
alter table products           enable row level security;
alter table product_images     enable row level security;
alter table stock_transactions enable row level security;

create policy product_types_select on product_types
  for select using (true);

create policy products_select_authenticated on products
  for select to authenticated using (true);

create policy products_update_authenticated on products
  for update to authenticated using (true) with check (true);

create policy product_images_select on product_images
  for select using (true);

create policy product_images_write_authenticated on product_images
  for all to authenticated using (true) with check (true);

create policy stock_transactions_select_authenticated on stock_transactions
  for select to authenticated using (true);

-- Storage: a public-read bucket for product photos, admin-only writes.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Public read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Admin upload product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images');

create policy "Admin update product images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images');

create policy "Admin delete product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images');
