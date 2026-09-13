-- 0015 revoked EXECUTE from PUBLIC, but that didn't actually close the
-- hole: Supabase provisions every new project with a database-level
-- default privilege that grants EXECUTE directly to the `anon` role
-- (not via PUBLIC) on every function created in the public schema.
-- Confirmed live: after running 0015, an anonymous request to
-- rpc/record_sale still executed the function body (got "product not
-- found" from inside the function, instead of a permission-denied
-- error) - proving anon still had EXECUTE via its own direct grant.
-- Revoke EXECUTE from anon explicitly on every write function, and fix
-- the default-privilege rule so future functions in this schema don't
-- get the same automatic anon grant.

revoke execute on function generate_product_code(uuid) from anon;
revoke execute on function create_product(uuid, text, numeric, numeric, int, boolean, text) from anon;
revoke execute on function record_sale(uuid, int) from anon;
revoke execute on function restock_product(uuid, int) from anon;
revoke execute on function sell_photo(uuid, int) from anon;
revoke execute on function acquire_photo(uuid, int) from anon;
revoke execute on function create_product_type(text, uuid) from anon;
revoke execute on function generate_type_prefix(text) from anon;

-- The stale 5-arg create_product overload from before is_multi_color
-- existed was never dropped (0010 added a 6-arg overload via CREATE OR
-- REPLACE without dropping the original 5-arg one first). It's now
-- causing PostgREST to refuse ambiguous calls, and it's also still
-- reachable by anon since it predates 0015/0016's function list. Drop
-- it outright - nothing in the app calls the 5-arg form any more.
drop function if exists create_product(uuid, text, numeric, numeric, int);

-- This is the actual fix for future functions: Supabase's project-level
-- default privilege was granting EXECUTE to anon at creation time. Undo
-- that default so new functions don't inherit it, while keeping the
-- authenticated default (admin RPCs still need to work without a
-- manual grant statement being remembered every time).
alter default privileges in schema public revoke execute on functions from anon;
