-- Optional color name per photo, for products where each photo is a
-- distinct color of the same design (set via "Multi-color" mode when
-- adding the product). Null for ordinary single-product photos.

alter table product_images add column color_label text;
