-- Postgres grants EXECUTE on every new function to PUBLIC by default.
-- All of the functions below are SECURITY DEFINER and bypass RLS by
-- design, but none of the prior migrations ever revoked that default
-- PUBLIC grant - meaning the public anon key (intentionally exposed to
-- the storefront) could call every one of these write RPCs directly,
-- with no login required. Lock them down to authenticated only, and
-- make sure future functions in this schema don't regress the same way.

revoke execute on function generate_product_code(uuid) from public;
revoke execute on function create_product(uuid, text, numeric, numeric, int, boolean, text) from public;
revoke execute on function record_sale(uuid, int) from public;
revoke execute on function restock_product(uuid, int) from public;
revoke execute on function sell_photo(uuid, int) from public;
revoke execute on function acquire_photo(uuid, int) from public;
revoke execute on function create_product_type(text, uuid) from public;
revoke execute on function generate_type_prefix(text) from public;

grant execute on function create_product(uuid, text, numeric, numeric, int, boolean, text) to authenticated;
grant execute on function record_sale(uuid, int) to authenticated;
grant execute on function restock_product(uuid, int) to authenticated;
grant execute on function sell_photo(uuid, int) to authenticated;
grant execute on function acquire_photo(uuid, int) to authenticated;
grant execute on function create_product_type(text, uuid) to authenticated;
grant execute on function generate_product_code(uuid) to authenticated;

-- generate_type_prefix has no side effects on its own, but it's an
-- internal helper called by create_product_type - lock it down too so
-- it can't be probed directly to burn through prefix sequence values.
grant execute on function generate_type_prefix(text) to authenticated;

-- Guard against this recurring for any function created in the future.
alter default privileges in schema public revoke execute on functions from public;
