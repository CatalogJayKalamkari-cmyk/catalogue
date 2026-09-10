-- Optional starter data. The admin can add more types from the app itself
-- (the "+ Add new type" option on the Add Product form), so this is just a
-- couple of examples to avoid an empty dropdown on first run — edit or
-- delete these to match the manufacturer's actual product range.
insert into product_types (name, prefix) values
  ('General', 'GEN'),
  ('Sample', 'SMP')
on conflict (name) do nothing;

-- The one admin/owner login is NOT created here — create it from the
-- Supabase dashboard (Authentication > Users > Add user) with the owner's
-- email and a password, and make sure Authentication > Providers > Email
-- has "Allow new users to sign up" turned OFF so no one else can register.
