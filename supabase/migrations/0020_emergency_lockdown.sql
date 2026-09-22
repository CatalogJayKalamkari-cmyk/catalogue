-- Super-admin emergency lockdown: lets the site owner instantly cut off
-- all public (anon) read access to the catalog data and photos in case of
-- an attack or abuse, and restore it just as quickly. Revokes GRANTs only
-- (never touches existing RLS policies) - Postgres checks table/column
-- grants before RLS is even consulted, so revoking anon's SELECT grant on
-- each surface fully blocks it on its own.

-- site_status: a tiny, deliberately still anon-readable table so the
-- public Catalog page can distinguish "intentionally closed" from
-- "broken" and show a clean message instead of a raw error. It carries
-- zero product/business data (one boolean + two audit fields).
create table site_status (
  id             boolean primary key default true,
  is_locked_down boolean not null default false,
  changed_at     timestamptz,
  changed_by     uuid,
  constraint site_status_singleton check (id)
);

insert into site_status (id, is_locked_down) values (true, false);

grant select on site_status to anon, authenticated;
alter table site_status enable row level security;
create policy site_status_select on site_status for select using (true);
-- No insert/update/delete grant to anyone - the only way to change
-- is_locked_down is through the two functions below, so the UI can never
-- drift out of sync with what's actually revoked.

create or replace function emergency_lockdown()
returns site_status
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row site_status;
begin
  revoke select on products_public from anon;

  revoke select (id, product_code, name, type_id, quantity, is_active,
                 created_at, is_multi_color, print_type)
    on products from anon;

  revoke select on product_types      from anon;
  revoke select on product_images     from anon;
  revoke select on product_categories from anon;

  -- The bucket's public flag gates the unauthenticated /object/public/
  -- route independently of any RLS policy on storage.objects, so this is
  -- simpler and more reliable than altering the existing no-`to`-clause
  -- "Public read product images" policy.
  update storage.buckets set public = false where id = 'product-images';

  update site_status
    set is_locked_down = true, changed_at = now(), changed_by = auth.uid()
    where id = true
  returning * into v_row;

  return v_row;
end;
$$;

revoke execute on function emergency_lockdown() from public, anon;
grant execute on function emergency_lockdown() to authenticated;

create or replace function restore_public_access()
returns site_status
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row site_status;
begin
  grant select on products_public to anon;

  grant select (id, product_code, name, type_id, quantity, is_active,
                created_at, is_multi_color, print_type)
    on products to anon;

  grant select on product_types      to anon;
  grant select on product_images     to anon;
  grant select on product_categories to anon;

  update storage.buckets set public = true where id = 'product-images';

  update site_status
    set is_locked_down = false, changed_at = now(), changed_by = auth.uid()
    where id = true
  returning * into v_row;

  return v_row;
end;
$$;

revoke execute on function restore_public_access() from public, anon;
grant execute on function restore_public_access() to authenticated;

-- Free-plan usage panel: database size and monthly active users, read
-- live so the super-admin page can mirror Supabase's own usage widget.
-- (File storage is already computable via the Storage API, no new
-- function needed - see src/lib/storageUsage.ts. Egress is deliberately
-- not included here - it's only exposed via Supabase's account-level
-- Management API, which needs a Personal Access Token that must never be
-- embedded in a public site.)

create or replace function get_database_size_bytes()
returns bigint
language sql
security definer
set search_path = public
as $$
  select pg_database_size(current_database());
$$;

revoke execute on function get_database_size_bytes() from public, anon;
grant execute on function get_database_size_bytes() to authenticated;

create or replace function get_monthly_active_users()
returns bigint
language sql
security definer
set search_path = public
as $$
  select count(*) from auth.users where last_sign_in_at > now() - interval '30 days';
$$;

revoke execute on function get_monthly_active_users() from public, anon;
grant execute on function get_monthly_active_users() to authenticated;
