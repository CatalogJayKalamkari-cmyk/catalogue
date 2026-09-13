-- Lets the admin mark an individual product photo as sold, for products
-- where each photo represents a distinct one-off item (e.g. a saree design
-- where every photo is a different color and only one unit of each color
-- exists). Purely a display flag - it does not touch products.quantity or
-- stock_transactions, since not every product uses per-photo tracking.

alter table product_images add column is_sold boolean not null default false;
