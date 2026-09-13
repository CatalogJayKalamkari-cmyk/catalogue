-- Belt-and-braces: prevent a product from ever being priced below cost,
-- even if the admin-form validation is ever bypassed or has a bug.
-- Added NOT VALID since an existing row (SAR-003) currently violates this
-- and needs a manual price correction - the constraint still applies to
-- every new insert/update from here on, including future edits to that row.

alter table products add constraint price_selling_gte_acquired
  check (price_selling >= price_acquired) not valid;
