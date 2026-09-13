-- Resolve the Supabase Advisor "Security Definer View" finding on
-- products_public (see the now-superseded rationale in 0003 for why it
-- was originally left as owner-bypass). Switching to security_invoker
-- means the view runs with the querying role's own privileges, so anon
-- needs its own narrow, column-level grant plus an explicit RLS policy
-- that mirrors the view's `is_active = true` filter — same data exposed
-- (price_acquired still never granted to anon), but via standard RLS
-- instead of relying on the view owner bypassing it.

grant select (id, product_code, name, type_id, price_selling, quantity, is_active, created_at)
  on products to anon;

create policy products_select_anon_active on products
  for select to anon
  using (is_active = true);

alter view products_public set (security_invoker = true);
