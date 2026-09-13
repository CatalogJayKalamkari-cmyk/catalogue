-- Auto-generated Kalamkari product taxonomy: categories + sub-types.
-- Prefixes are computed by generate_type_prefix() (defined in 0012) at insert time.

insert into product_categories (name, sort_order) values
  ('Sarees', 1),
  ('Dress Materials', 2),
  ('Dupattas & Stoles', 3),
  ('Blouse Products', 4),
  ('Women''s Ready-Made Clothing', 5),
  ('Men''s Products', 6),
  ('Bags & Pouches', 7),
  ('Home Decor / Wall Art', 8),
  ('Home Furnishing', 9),
  ('Kitchen / Dining', 10),
  ('Personal / Utility Items', 11),
  ('Baby & Kids', 12),
  ('Accessories', 13),
  ('Stationery / Gift Products', 14),
  ('Decorative / Festival Products', 15),
  ('Fabric / Raw Material', 16)
on conflict (name) do nothing;

-- Sarees
insert into product_types (name, prefix, category_id)
select 'Kalamkari Cotton Sarees', generate_type_prefix('Kalamkari Cotton Sarees'), id from product_categories where name = 'Sarees'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Silk Sarees', generate_type_prefix('Kalamkari Silk Sarees'), id from product_categories where name = 'Sarees'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Cotton-Silk Sarees', generate_type_prefix('Kalamkari Cotton-Silk Sarees'), id from product_categories where name = 'Sarees'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Kota Sarees', generate_type_prefix('Kalamkari Kota Sarees'), id from product_categories where name = 'Sarees'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Khadi Sarees', generate_type_prefix('Kalamkari Khadi Sarees'), id from product_categories where name = 'Sarees'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Rayon Sarees', generate_type_prefix('Kalamkari Rayon Sarees'), id from product_categories where name = 'Sarees'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Linen Sarees', generate_type_prefix('Kalamkari Linen Sarees'), id from product_categories where name = 'Sarees'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Hand-Painted Sarees', generate_type_prefix('Kalamkari Hand-Painted Sarees'), id from product_categories where name = 'Sarees'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Hand-Block Printed Sarees', generate_type_prefix('Kalamkari Hand-Block Printed Sarees'), id from product_categories where name = 'Sarees'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Printed Sarees', generate_type_prefix('Kalamkari Printed Sarees'), id from product_categories where name = 'Sarees'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Designer Sarees', generate_type_prefix('Kalamkari Designer Sarees'), id from product_categories where name = 'Sarees'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Casual Sarees', generate_type_prefix('Kalamkari Casual Sarees'), id from product_categories where name = 'Sarees'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Bridal / Festive Sarees', generate_type_prefix('Kalamkari Bridal / Festive Sarees'), id from product_categories where name = 'Sarees'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Running Border Sarees', generate_type_prefix('Kalamkari Running Border Sarees'), id from product_categories where name = 'Sarees'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Zari Border Sarees', generate_type_prefix('Kalamkari Zari Border Sarees'), id from product_categories where name = 'Sarees'
on conflict (name) do nothing;

-- Dress Materials
insert into product_types (name, prefix, category_id)
select 'Kalamkari 3-Piece Dress Material', generate_type_prefix('Kalamkari 3-Piece Dress Material'), id from product_categories where name = 'Dress Materials'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari 2-Piece Dress Material', generate_type_prefix('Kalamkari 2-Piece Dress Material'), id from product_categories where name = 'Dress Materials'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Cotton Dress Material', generate_type_prefix('Kalamkari Cotton Dress Material'), id from product_categories where name = 'Dress Materials'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Silk Dress Material', generate_type_prefix('Kalamkari Silk Dress Material'), id from product_categories where name = 'Dress Materials'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Printed Dress Material', generate_type_prefix('Kalamkari Printed Dress Material'), id from product_categories where name = 'Dress Materials'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Hand-Painted Dress Material', generate_type_prefix('Kalamkari Hand-Painted Dress Material'), id from product_categories where name = 'Dress Materials'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Suit Material', generate_type_prefix('Kalamkari Suit Material'), id from product_categories where name = 'Dress Materials'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Unstitched Dress Material', generate_type_prefix('Kalamkari Unstitched Dress Material'), id from product_categories where name = 'Dress Materials'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Salwar Suit Material', generate_type_prefix('Kalamkari Salwar Suit Material'), id from product_categories where name = 'Dress Materials'
on conflict (name) do nothing;

-- Dupattas & Stoles
insert into product_types (name, prefix, category_id)
select 'Kalamkari Dupattas', generate_type_prefix('Kalamkari Dupattas'), id from product_categories where name = 'Dupattas & Stoles'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Cotton Dupattas', generate_type_prefix('Kalamkari Cotton Dupattas'), id from product_categories where name = 'Dupattas & Stoles'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Silk Dupattas', generate_type_prefix('Kalamkari Silk Dupattas'), id from product_categories where name = 'Dupattas & Stoles'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Chunni', generate_type_prefix('Kalamkari Chunni'), id from product_categories where name = 'Dupattas & Stoles'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Stoles', generate_type_prefix('Kalamkari Stoles'), id from product_categories where name = 'Dupattas & Stoles'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Scarves', generate_type_prefix('Kalamkari Scarves'), id from product_categories where name = 'Dupattas & Stoles'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Hand-Painted Dupattas', generate_type_prefix('Kalamkari Hand-Painted Dupattas'), id from product_categories where name = 'Dupattas & Stoles'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Block-Printed Dupattas', generate_type_prefix('Kalamkari Block-Printed Dupattas'), id from product_categories where name = 'Dupattas & Stoles'
on conflict (name) do nothing;

-- Blouse Products
insert into product_types (name, prefix, category_id)
select 'Kalamkari Blouse Pieces', generate_type_prefix('Kalamkari Blouse Pieces'), id from product_categories where name = 'Blouse Products'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Ready-Made Blouses', generate_type_prefix('Kalamkari Ready-Made Blouses'), id from product_categories where name = 'Blouse Products'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Blouse Fabric', generate_type_prefix('Kalamkari Blouse Fabric'), id from product_categories where name = 'Blouse Products'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Designer Blouses', generate_type_prefix('Kalamkari Designer Blouses'), id from product_categories where name = 'Blouse Products'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Saree Blouse Material', generate_type_prefix('Kalamkari Saree Blouse Material'), id from product_categories where name = 'Blouse Products'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Contrast Blouse Pieces', generate_type_prefix('Kalamkari Contrast Blouse Pieces'), id from product_categories where name = 'Blouse Products'
on conflict (name) do nothing;

-- Women's Ready-Made Clothing
insert into product_types (name, prefix, category_id)
select 'Kalamkari Kurtis', generate_type_prefix('Kalamkari Kurtis'), id from product_categories where name = 'Women''s Ready-Made Clothing'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Kurta', generate_type_prefix('Kalamkari Kurta'), id from product_categories where name = 'Women''s Ready-Made Clothing'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Tops', generate_type_prefix('Kalamkari Tops'), id from product_categories where name = 'Women''s Ready-Made Clothing'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Dresses', generate_type_prefix('Kalamkari Dresses'), id from product_categories where name = 'Women''s Ready-Made Clothing'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Frocks', generate_type_prefix('Kalamkari Frocks'), id from product_categories where name = 'Women''s Ready-Made Clothing'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Maxi Dresses', generate_type_prefix('Kalamkari Maxi Dresses'), id from product_categories where name = 'Women''s Ready-Made Clothing'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Kaftans', generate_type_prefix('Kalamkari Kaftans'), id from product_categories where name = 'Women''s Ready-Made Clothing'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Skirts', generate_type_prefix('Kalamkari Skirts'), id from product_categories where name = 'Women''s Ready-Made Clothing'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Palazzos', generate_type_prefix('Kalamkari Palazzos'), id from product_categories where name = 'Women''s Ready-Made Clothing'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Pants', generate_type_prefix('Kalamkari Pants'), id from product_categories where name = 'Women''s Ready-Made Clothing'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Leggings', generate_type_prefix('Kalamkari Leggings'), id from product_categories where name = 'Women''s Ready-Made Clothing'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Co-Ord Sets', generate_type_prefix('Kalamkari Co-Ord Sets'), id from product_categories where name = 'Women''s Ready-Made Clothing'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Tunics', generate_type_prefix('Kalamkari Tunics'), id from product_categories where name = 'Women''s Ready-Made Clothing'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Nighties', generate_type_prefix('Kalamkari Nighties'), id from product_categories where name = 'Women''s Ready-Made Clothing'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Nightwear', generate_type_prefix('Kalamkari Nightwear'), id from product_categories where name = 'Women''s Ready-Made Clothing'
on conflict (name) do nothing;

-- Men's Products
insert into product_types (name, prefix, category_id)
select 'Kalamkari Men''s Kurtas', generate_type_prefix('Kalamkari Men''s Kurtas'), id from product_categories where name = 'Men''s Products'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Shirts', generate_type_prefix('Kalamkari Shirts'), id from product_categories where name = 'Men''s Products'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari T-Shirts', generate_type_prefix('Kalamkari T-Shirts'), id from product_categories where name = 'Men''s Products'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Short Kurtas', generate_type_prefix('Kalamkari Short Kurtas'), id from product_categories where name = 'Men''s Products'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Men''s Pants', generate_type_prefix('Kalamkari Men''s Pants'), id from product_categories where name = 'Men''s Products'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Shorts', generate_type_prefix('Kalamkari Shorts'), id from product_categories where name = 'Men''s Products'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Dhoti', generate_type_prefix('Kalamkari Dhoti'), id from product_categories where name = 'Men''s Products'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Lungi', generate_type_prefix('Kalamkari Lungi'), id from product_categories where name = 'Men''s Products'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Angavastram', generate_type_prefix('Kalamkari Angavastram'), id from product_categories where name = 'Men''s Products'
on conflict (name) do nothing;

-- Bags & Pouches
insert into product_types (name, prefix, category_id)
select 'Kalamkari Hand Bags', generate_type_prefix('Kalamkari Hand Bags'), id from product_categories where name = 'Bags & Pouches'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Hand Purses', generate_type_prefix('Kalamkari Hand Purses'), id from product_categories where name = 'Bags & Pouches'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Sling Bags', generate_type_prefix('Kalamkari Sling Bags'), id from product_categories where name = 'Bags & Pouches'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Shoulder Bags', generate_type_prefix('Kalamkari Shoulder Bags'), id from product_categories where name = 'Bags & Pouches'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Tote Bags', generate_type_prefix('Kalamkari Tote Bags'), id from product_categories where name = 'Bags & Pouches'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Shopping Bags', generate_type_prefix('Kalamkari Shopping Bags'), id from product_categories where name = 'Bags & Pouches'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Potli Bags', generate_type_prefix('Kalamkari Potli Bags'), id from product_categories where name = 'Bags & Pouches'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Clutch Bags', generate_type_prefix('Kalamkari Clutch Bags'), id from product_categories where name = 'Bags & Pouches'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Pouches', generate_type_prefix('Kalamkari Pouches'), id from product_categories where name = 'Bags & Pouches'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Coin Pouches', generate_type_prefix('Kalamkari Coin Pouches'), id from product_categories where name = 'Bags & Pouches'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Makeup Pouches', generate_type_prefix('Kalamkari Makeup Pouches'), id from product_categories where name = 'Bags & Pouches'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Mobile Pouches', generate_type_prefix('Kalamkari Mobile Pouches'), id from product_categories where name = 'Bags & Pouches'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Laptop Bags', generate_type_prefix('Kalamkari Laptop Bags'), id from product_categories where name = 'Bags & Pouches'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Travel Bags', generate_type_prefix('Kalamkari Travel Bags'), id from product_categories where name = 'Bags & Pouches'
on conflict (name) do nothing;

-- Home Decor / Wall Art
insert into product_types (name, prefix, category_id)
select 'Kalamkari Wall Art', generate_type_prefix('Kalamkari Wall Art'), id from product_categories where name = 'Home Decor / Wall Art'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Wall Hangings', generate_type_prefix('Kalamkari Wall Hangings'), id from product_categories where name = 'Home Decor / Wall Art'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Wall Panels', generate_type_prefix('Kalamkari Wall Panels'), id from product_categories where name = 'Home Decor / Wall Art'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Paintings', generate_type_prefix('Kalamkari Paintings'), id from product_categories where name = 'Home Decor / Wall Art'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Canvas Art', generate_type_prefix('Kalamkari Canvas Art'), id from product_categories where name = 'Home Decor / Wall Art'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Temple Wall Hangings', generate_type_prefix('Kalamkari Temple Wall Hangings'), id from product_categories where name = 'Home Decor / Wall Art'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari God & Goddess Paintings', generate_type_prefix('Kalamkari God & Goddess Paintings'), id from product_categories where name = 'Home Decor / Wall Art'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Scroll Paintings', generate_type_prefix('Kalamkari Scroll Paintings'), id from product_categories where name = 'Home Decor / Wall Art'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Door Hangings', generate_type_prefix('Kalamkari Door Hangings'), id from product_categories where name = 'Home Decor / Wall Art'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Toranas', generate_type_prefix('Kalamkari Toranas'), id from product_categories where name = 'Home Decor / Wall Art'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Photo Frames', generate_type_prefix('Kalamkari Photo Frames'), id from product_categories where name = 'Home Decor / Wall Art'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Decorative Panels', generate_type_prefix('Kalamkari Decorative Panels'), id from product_categories where name = 'Home Decor / Wall Art'
on conflict (name) do nothing;

-- Home Furnishing
insert into product_types (name, prefix, category_id)
select 'Kalamkari Bed Sheets', generate_type_prefix('Kalamkari Bed Sheets'), id from product_categories where name = 'Home Furnishing'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Bed Covers', generate_type_prefix('Kalamkari Bed Covers'), id from product_categories where name = 'Home Furnishing'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Bedspreads', generate_type_prefix('Kalamkari Bedspreads'), id from product_categories where name = 'Home Furnishing'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Pillow Covers', generate_type_prefix('Kalamkari Pillow Covers'), id from product_categories where name = 'Home Furnishing'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Cushion Covers', generate_type_prefix('Kalamkari Cushion Covers'), id from product_categories where name = 'Home Furnishing'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Table Covers', generate_type_prefix('Kalamkari Table Covers'), id from product_categories where name = 'Home Furnishing'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Table Runners', generate_type_prefix('Kalamkari Table Runners'), id from product_categories where name = 'Home Furnishing'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Table Mats', generate_type_prefix('Kalamkari Table Mats'), id from product_categories where name = 'Home Furnishing'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Dining Mats', generate_type_prefix('Kalamkari Dining Mats'), id from product_categories where name = 'Home Furnishing'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Curtains', generate_type_prefix('Kalamkari Curtains'), id from product_categories where name = 'Home Furnishing'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Door Curtains', generate_type_prefix('Kalamkari Door Curtains'), id from product_categories where name = 'Home Furnishing'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Sofa Covers', generate_type_prefix('Kalamkari Sofa Covers'), id from product_categories where name = 'Home Furnishing'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Quilts', generate_type_prefix('Kalamkari Quilts'), id from product_categories where name = 'Home Furnishing'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Prayer Mats', generate_type_prefix('Kalamkari Prayer Mats'), id from product_categories where name = 'Home Furnishing'
on conflict (name) do nothing;

-- Kitchen / Dining
insert into product_types (name, prefix, category_id)
select 'Kalamkari Kitchen Towels', generate_type_prefix('Kalamkari Kitchen Towels'), id from product_categories where name = 'Kitchen / Dining'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Tea Towels', generate_type_prefix('Kalamkari Tea Towels'), id from product_categories where name = 'Kitchen / Dining'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Napkins', generate_type_prefix('Kalamkari Napkins'), id from product_categories where name = 'Kitchen / Dining'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Aprons', generate_type_prefix('Kalamkari Aprons'), id from product_categories where name = 'Kitchen / Dining'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Pot Holders', generate_type_prefix('Kalamkari Pot Holders'), id from product_categories where name = 'Kitchen / Dining'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Kitchen Pouches', generate_type_prefix('Kalamkari Kitchen Pouches'), id from product_categories where name = 'Kitchen / Dining'
on conflict (name) do nothing;

-- Personal / Utility Items
insert into product_types (name, prefix, category_id)
select 'Kalamkari Handkerchiefs', generate_type_prefix('Kalamkari Handkerchiefs'), id from product_categories where name = 'Personal / Utility Items'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Face Towels', generate_type_prefix('Kalamkari Face Towels'), id from product_categories where name = 'Personal / Utility Items'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Hand Towels', generate_type_prefix('Kalamkari Hand Towels'), id from product_categories where name = 'Personal / Utility Items'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Bath Towels', generate_type_prefix('Kalamkari Bath Towels'), id from product_categories where name = 'Personal / Utility Items'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Small Towels', generate_type_prefix('Kalamkari Small Towels'), id from product_categories where name = 'Personal / Utility Items'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Bandanas', generate_type_prefix('Kalamkari Bandanas'), id from product_categories where name = 'Personal / Utility Items'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Headbands', generate_type_prefix('Kalamkari Headbands'), id from product_categories where name = 'Personal / Utility Items'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Hair Accessories', generate_type_prefix('Kalamkari Hair Accessories'), id from product_categories where name = 'Personal / Utility Items'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Utility Pouches', generate_type_prefix('Kalamkari Utility Pouches'), id from product_categories where name = 'Personal / Utility Items'
on conflict (name) do nothing;

-- Baby & Kids
insert into product_types (name, prefix, category_id)
select 'Kalamkari Kids Frocks', generate_type_prefix('Kalamkari Kids Frocks'), id from product_categories where name = 'Baby & Kids'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Kids Kurtas', generate_type_prefix('Kalamkari Kids Kurtas'), id from product_categories where name = 'Baby & Kids'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Kids Dresses', generate_type_prefix('Kalamkari Kids Dresses'), id from product_categories where name = 'Baby & Kids'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Kids Tops', generate_type_prefix('Kalamkari Kids Tops'), id from product_categories where name = 'Baby & Kids'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Kids Shirts', generate_type_prefix('Kalamkari Kids Shirts'), id from product_categories where name = 'Baby & Kids'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Kids Shorts', generate_type_prefix('Kalamkari Kids Shorts'), id from product_categories where name = 'Baby & Kids'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Kids Skirts', generate_type_prefix('Kalamkari Kids Skirts'), id from product_categories where name = 'Baby & Kids'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Baby Dresses', generate_type_prefix('Kalamkari Baby Dresses'), id from product_categories where name = 'Baby & Kids'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Baby Frocks', generate_type_prefix('Kalamkari Baby Frocks'), id from product_categories where name = 'Baby & Kids'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Kids Nightwear', generate_type_prefix('Kalamkari Kids Nightwear'), id from product_categories where name = 'Baby & Kids'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Kids Co-Ord Sets', generate_type_prefix('Kalamkari Kids Co-Ord Sets'), id from product_categories where name = 'Baby & Kids'
on conflict (name) do nothing;

-- Accessories
insert into product_types (name, prefix, category_id)
select 'Kalamkari Wallets', generate_type_prefix('Kalamkari Wallets'), id from product_categories where name = 'Accessories'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Coin Purses', generate_type_prefix('Kalamkari Coin Purses'), id from product_categories where name = 'Accessories'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Jewelry Pouches', generate_type_prefix('Kalamkari Jewelry Pouches'), id from product_categories where name = 'Accessories'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Bangles', generate_type_prefix('Kalamkari Bangles'), id from product_categories where name = 'Accessories'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Fabric Accessories', generate_type_prefix('Kalamkari Fabric Accessories'), id from product_categories where name = 'Accessories'
on conflict (name) do nothing;

-- Stationery / Gift Products
insert into product_types (name, prefix, category_id)
select 'Kalamkari Notebooks', generate_type_prefix('Kalamkari Notebooks'), id from product_categories where name = 'Stationery / Gift Products'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Diary Covers', generate_type_prefix('Kalamkari Diary Covers'), id from product_categories where name = 'Stationery / Gift Products'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari File Covers', generate_type_prefix('Kalamkari File Covers'), id from product_categories where name = 'Stationery / Gift Products'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Document Folders', generate_type_prefix('Kalamkari Document Folders'), id from product_categories where name = 'Stationery / Gift Products'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Pen Pouches', generate_type_prefix('Kalamkari Pen Pouches'), id from product_categories where name = 'Stationery / Gift Products'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Book Covers', generate_type_prefix('Kalamkari Book Covers'), id from product_categories where name = 'Stationery / Gift Products'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Gift Bags', generate_type_prefix('Kalamkari Gift Bags'), id from product_categories where name = 'Stationery / Gift Products'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Gift Boxes', generate_type_prefix('Kalamkari Gift Boxes'), id from product_categories where name = 'Stationery / Gift Products'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Greeting Cards', generate_type_prefix('Kalamkari Greeting Cards'), id from product_categories where name = 'Stationery / Gift Products'
on conflict (name) do nothing;

-- Decorative / Festival Products
insert into product_types (name, prefix, category_id)
select 'Kalamkari Pooja Cloth', generate_type_prefix('Kalamkari Pooja Cloth'), id from product_categories where name = 'Decorative / Festival Products'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Mandir Backdrops', generate_type_prefix('Kalamkari Mandir Backdrops'), id from product_categories where name = 'Decorative / Festival Products'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Canopies', generate_type_prefix('Kalamkari Canopies'), id from product_categories where name = 'Decorative / Festival Products'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Festival Decor', generate_type_prefix('Kalamkari Festival Decor'), id from product_categories where name = 'Decorative / Festival Products'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Wedding Decor', generate_type_prefix('Kalamkari Wedding Decor'), id from product_categories where name = 'Decorative / Festival Products'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Return Gift Bags', generate_type_prefix('Kalamkari Return Gift Bags'), id from product_categories where name = 'Decorative / Festival Products'
on conflict (name) do nothing;

-- Fabric / Raw Material
insert into product_types (name, prefix, category_id)
select 'Kalamkari Cotton Fabric', generate_type_prefix('Kalamkari Cotton Fabric'), id from product_categories where name = 'Fabric / Raw Material'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Silk Fabric', generate_type_prefix('Kalamkari Silk Fabric'), id from product_categories where name = 'Fabric / Raw Material'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Rayon Fabric', generate_type_prefix('Kalamkari Rayon Fabric'), id from product_categories where name = 'Fabric / Raw Material'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Linen Fabric', generate_type_prefix('Kalamkari Linen Fabric'), id from product_categories where name = 'Fabric / Raw Material'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Hand-Block Fabric', generate_type_prefix('Kalamkari Hand-Block Fabric'), id from product_categories where name = 'Fabric / Raw Material'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Hand-Painted Fabric', generate_type_prefix('Kalamkari Hand-Painted Fabric'), id from product_categories where name = 'Fabric / Raw Material'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Pen Kalamkari Fabric', generate_type_prefix('Pen Kalamkari Fabric'), id from product_categories where name = 'Fabric / Raw Material'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Printed Fabric', generate_type_prefix('Kalamkari Printed Fabric'), id from product_categories where name = 'Fabric / Raw Material'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Running Fabric', generate_type_prefix('Kalamkari Running Fabric'), id from product_categories where name = 'Fabric / Raw Material'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Curtain Fabric', generate_type_prefix('Kalamkari Curtain Fabric'), id from product_categories where name = 'Fabric / Raw Material'
on conflict (name) do nothing;
insert into product_types (name, prefix, category_id)
select 'Kalamkari Upholstery Fabric', generate_type_prefix('Kalamkari Upholstery Fabric'), id from product_categories where name = 'Fabric / Raw Material'
on conflict (name) do nothing;

