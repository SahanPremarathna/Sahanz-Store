begin;

insert into public.categories (id, name, slug, sort_order)
values
  ('10000000-0000-0000-0000-000000000001', 'Groceries', 'groceries', 1),
  ('10000000-0000-0000-0000-000000000002', 'Fresh Produce', 'fresh-produce', 2),
  ('10000000-0000-0000-0000-000000000003', 'Dairy & Eggs', 'dairy-eggs', 3),
  ('10000000-0000-0000-0000-000000000004', 'Bakery', 'bakery', 4),
  ('10000000-0000-0000-0000-000000000005', 'Meat & Seafood', 'meat-seafood', 5),
  ('10000000-0000-0000-0000-000000000006', 'Beverages', 'beverages', 6),
  ('10000000-0000-0000-0000-000000000007', 'Snacks', 'snacks', 7),
  ('10000000-0000-0000-0000-000000000008', 'Frozen Foods', 'frozen-foods', 8),
  ('10000000-0000-0000-0000-000000000009', 'Household', 'household', 9),
  ('10000000-0000-0000-0000-000000000010', 'Personal Care', 'personal-care', 10),
  ('10000000-0000-0000-0000-000000000011', 'Baby & Kids', 'baby-kids', 11),
  ('10000000-0000-0000-0000-000000000012', 'Pet Supplies', 'pet-supplies', 12),
  ('10000000-0000-0000-0000-000000000013', 'Health & Wellness', 'health-wellness', 13),
  ('10000000-0000-0000-0000-000000000014', 'Pharmacy', 'pharmacy', 14),
  ('10000000-0000-0000-0000-000000000015', 'Electronics & Accessories', 'electronics-accessories', 15),
  ('10000000-0000-0000-0000-000000000016', 'Office & Stationery', 'office-stationery', 16),
  ('10000000-0000-0000-0000-000000000017', 'Home & Living', 'home-living', 17),
  ('10000000-0000-0000-0000-000000000018', 'Adult Wellness', 'adult-wellness', 18)
on conflict (id) do update
set
  name = excluded.name,
  slug = excluded.slug,
  sort_order = excluded.sort_order;

commit;
