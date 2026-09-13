-- Two-level product taxonomy: a fixed set of categories (Sarees, Dress
-- Materials, ...), each containing several specific sub-types (Kalamkari
-- Cotton Sarees, Kalamkari Silk Sarees, ...). product_types becomes the
-- sub-type level, now scoped under a category.

create table product_categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  sort_order int  not null default 0
);

grant select on product_categories to anon, authenticated;
alter table product_categories enable row level security;
create policy product_categories_select on product_categories for select using (true);

alter table product_types add column category_id uuid references product_categories(id);

-- Auto-generate a unique 4-letter prefix from a sub-type name, so the
-- admin never has to invent a product code by hand. Strips "Kalamkari"
-- and punctuation, takes 2 letters from each of the first two remaining
-- significant words (padding/truncating as needed), then resolves any
-- collision by substituting trailing digits.
create or replace function generate_type_prefix(p_name text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_words text[];
  v_base text;
  v_candidate text;
  v_suffix int := 1;
begin
  v_words := regexp_split_to_array(
    regexp_replace(regexp_replace(upper(p_name), 'KALAMKARI', '', 'gi'), '[^A-Za-z ]', ' ', 'g'),
    '\s+'
  );
  v_words := array_remove(v_words, '');

  if array_length(v_words, 1) >= 2 then
    v_base := left(v_words[1], 2) || left(v_words[2], 2);
  elsif array_length(v_words, 1) = 1 then
    v_base := rpad(left(v_words[1], 4), 4, 'X');
  else
    v_base := 'PROD';
  end if;
  v_base := rpad(left(v_base, 4), 4, 'X');

  v_candidate := v_base;
  while exists (select 1 from product_types where prefix = v_candidate) loop
    v_candidate := left(v_base, 3) || (v_suffix % 10)::text;
    v_suffix := v_suffix + 1;
  end loop;

  return v_candidate;
end;
$$;

-- create_product_type now takes a category and generates its own prefix
-- instead of requiring the admin to type one. Drop the old (name, prefix)
-- signature so it doesn't linger as a separate overload.
drop function if exists create_product_type(text, text);

create or replace function create_product_type(p_name text, p_category_id uuid)
returns product_types
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row product_types;
begin
  insert into product_types (name, prefix, category_id)
  values (trim(p_name), generate_type_prefix(p_name), p_category_id)
  returning * into v_row;
  return v_row;
end;
$$;

grant execute on function create_product_type(text, uuid) to authenticated;
