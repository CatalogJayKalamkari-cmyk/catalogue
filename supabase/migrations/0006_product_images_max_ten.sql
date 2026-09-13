-- Raise the per-product photo limit from 3 to 10 (sort_order 0-9).

alter table product_images drop constraint if exists product_images_sort_order_check;
alter table product_images add constraint product_images_sort_order_check
  check (sort_order between 0 and 9);
