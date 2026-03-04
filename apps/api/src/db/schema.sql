create extension if not exists pgcrypto;

drop table if exists public.delivery_tasks cascade;
drop table if exists public.order_items cascade;
drop table if exists public.orders cascade;
drop table if exists public.seller_products cascade;
drop table if exists public.categories cascade;
drop table if exists public.profiles cascade;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  email text not null unique,
  password_hash text not null,
  full_name text not null,
  role text not null check (role in ('customer', 'seller', 'delivery')),
  phone text not null default '',
  address text not null default '',
  business_name text not null default '',
  business_address text not null default '',
  service_area text not null default '',
  vehicle_type text not null default '',
  profile_note text not null default '',
  avatar_url text not null default '',
  saved_addresses jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.seller_products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete restrict,
  title text not null,
  slug text not null unique,
  description text not null default '',
  long_description text not null default '',
  details jsonb not null default '[]'::jsonb,
  ingredients jsonb not null default '[]'::jsonb,
  usage_notes text not null default '',
  storage_notes text not null default '',
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'LKR',
  image_url text not null default '',
  gallery_images jsonb not null default '[]'::jsonb,
  inventory_count integer not null default 0 check (inventory_count >= 0),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete restrict,
  seller_id uuid not null references public.profiles(id) on delete restrict,
  delivery_rider_id uuid references public.profiles(id) on delete set null,
  status text not null default 'pending' check (
    status in ('pending', 'processing', 'out_for_delivery', 'delivered', 'cancelled')
  ),
  delivery_status text not null default 'awaiting_assignment' check (
    delivery_status in ('awaiting_assignment', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled')
  ),
  total_cents integer not null check (total_cents >= 0),
  currency text not null default 'LKR',
  recipient_name text not null default '',
  delivery_address text not null,
  delivery_address_line_1 text not null default '',
  delivery_address_line_2 text not null default '',
  delivery_city text not null default '',
  delivery_postal_code text not null default '',
  delivery_latitude double precision,
  delivery_longitude double precision,
  notes text not null default '',
  cancelled_by_role text not null default '' check (
    cancelled_by_role in ('', 'customer', 'seller')
  ),
  cancellation_reason text not null default '',
  cancellation_note text not null default '',
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (delivery_latitude is null and delivery_longitude is null)
    or (
      delivery_latitude between -90 and 90
      and delivery_longitude between -180 and 180
    )
  )
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  seller_product_id uuid not null references public.seller_products(id) on delete restrict,
  title_snapshot text not null,
  image_url_snapshot text not null default '',
  quantity integer not null check (quantity > 0),
  price_cents integer not null check (price_cents >= 0),
  created_at timestamptz not null default now()
);

create table public.delivery_tasks (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  rider_id uuid not null references public.profiles(id) on delete restrict,
  status text not null default 'assigned' check (
    status in ('assigned', 'picked_up', 'in_transit', 'delivered')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_role on public.profiles(role);
create index idx_seller_products_category on public.seller_products(category_id);
create index idx_seller_products_seller on public.seller_products(seller_id);
create index idx_orders_customer on public.orders(customer_id);
create index idx_orders_seller on public.orders(seller_id);
create index idx_delivery_tasks_rider on public.delivery_tasks(rider_id);

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.seller_products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.delivery_tasks enable row level security;

create policy "Public can read categories"
on public.categories
for select
using (true);

create policy "Public can read active seller products"
on public.seller_products
for select
using (is_active = true);

create policy "Service role manages profiles"
on public.profiles
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "Service role manages categories"
on public.categories
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "Service role manages seller products"
on public.seller_products
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "Service role manages orders"
on public.orders
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "Service role manages order items"
on public.order_items
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "Service role manages delivery tasks"
on public.delivery_tasks
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

insert into public.profiles (
  id,
  username,
  email,
  password_hash,
  full_name,
  role,
  phone,
  address,
  business_name,
  business_address,
  service_area,
  vehicle_type,
  profile_note,
  avatar_url,
  saved_addresses
)
values
  (
    '00000000-0000-0000-0000-000000000101',
    'nethmi',
    'customer@sahanz.store',
    'scrypt:f4fb65eb05e766929682c3d0c649c5b6:254f394899fc84b5265058eb13304bee59f3701deda9fe4f9c7f1fae6ef634f7cbad910418a0f51df98f2848437e39256e941768d61d7bca3322067a3154f8fc',
    'Nethmi Perera',
    'customer',
    '0770000001',
    '12 Lake Road, Colombo 08',
    '',
    '',
    'Colombo 08',
    '',
    'Ring the bell once and call if needed.',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    '[
      {
        "id": "addr-home",
        "label": "Home",
        "recipient_name": "Nethmi Perera",
        "address": "12 Lake Road, Colombo 08",
        "address_line_1": "12 Lake Road",
        "address_line_2": "",
        "city": "Colombo 08",
        "postal_code": "00800",
        "latitude": 6.914700,
        "longitude": 79.877000,
        "is_default": true
      },
      {
        "id": "addr-office",
        "label": "Office",
        "recipient_name": "Nethmi Perera",
        "address": "75 Union Place, Colombo 02",
        "address_line_1": "75 Union Place",
        "address_line_2": "",
        "city": "Colombo 02",
        "postal_code": "00200",
        "latitude": 6.917200,
        "longitude": 79.861100,
        "is_default": false
      }
    ]'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000201',
    'sahanzmart',
    'seller@sahanz.store',
    'scrypt:02435f7038116ab22d4c2a8d4c4d0508:ca87a83c630a828408ecd45f512cf7f6ae6e0febfb9575126fe121632c5426e0bbf638dd18f15b9d2de370b1080f580e558ba0b66d7818e086b9446a51a6785e',
    'Sahanz Mart',
    'seller',
    '0770000002',
    '',
    'Sahanz Mart',
    '58 Ward Place, Colombo 07',
    'Colombo 01-08',
    '',
    'Open daily from 7 AM to 10 PM.',
    'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=400&q=80',
    '[]'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000301',
    'rashmika',
    'delivery@sahanz.store',
    'scrypt:9c6c99fa39e6ce71d7f08130c848fc07:71d5b206d43363c1b0c99f403e5b7981f6f69c7711baa9295a3e76f925c6025f3b598223c137a263bb5804dde48417f8335ffb0457d4c9661aca3521b2a14d89',
    'Rashmika Rider',
    'delivery',
    '0770000003',
    '',
    '',
    '',
    'Colombo Central',
    'Motorbike',
    'Prefers pickup batching during busy hours.',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    '[]'::jsonb
  );

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
  ('10000000-0000-0000-0000-000000000018', 'Adult Wellness', 'adult-wellness', 18);

insert into public.seller_products (
  id,
  seller_id,
  category_id,
  title,
  slug,
  description,
  price_cents,
  currency,
  image_url,
  inventory_count,
  sort_order
)
values
  (
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000201',
    '10000000-0000-0000-0000-000000000001',
    'Nadu Rice 5kg',
    'nadu-rice-5kg-seller-1',
    'Fresh household rice packed for weekly kitchen use.',
    245000,
    'LKR',
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=80',
    18,
    1
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000201',
    '10000000-0000-0000-0000-000000000002',
    'Ceylon Tea 400g',
    'ceylon-tea-400g-seller-1',
    'Strong breakfast tea blend packed by the seller.',
    92000,
    'LKR',
    'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=900&q=80',
    35,
    2
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000201',
    '10000000-0000-0000-0000-000000000003',
    'Dish Wash Liquid 1L',
    'dish-wash-liquid-1l-seller-1',
    'Kitchen-safe cleaning liquid with citrus fragrance.',
    135000,
    'LKR',
    'https://images.unsplash.com/photo-1583947582886-f40ec95dd752?auto=format&fit=crop&w=900&q=80',
    24,
    3
  );

update public.seller_products
set
  long_description = case title
    when 'Nadu Rice 5kg' then 'Nadu Rice 5kg is packed as a dependable everyday kitchen staple for regular home cooking. The grain is suited for family meals, pantry restocks, and bulk weekly shopping, making it an easy choice for households that want a familiar rice option that works across lunch and dinner dishes. It is positioned as a practical repeat-buy item that balances quantity, convenience, and value.'
    when 'Ceylon Tea 400g' then 'Ceylon Tea 400g is stocked as a strong daily tea option for homes that want a fuller cup through the morning and evening. The blend is intended for routine brewing, guest service, and pantry top-ups, giving shoppers a reliable tea product that fits both everyday use and larger household needs. It is priced and packed to feel like a regular staple rather than a one-off purchase.'
    when 'Dish Wash Liquid 1L' then 'Dish Wash Liquid 1L is designed as a core household cleaning essential for kitchens that need consistent grease-cutting performance through the week. The size makes it practical for repeat washing, family kitchen use, and general sink-side cleanup, while the product itself is positioned as a straightforward home care item that shoppers can repurchase without second-guessing the category.'
    else description
  end,
  details = case title
    when 'Nadu Rice 5kg' then '["Family-size pantry pack", "Suitable for daily rice meals", "Balanced for regular household cooking"]'::jsonb
    when 'Ceylon Tea 400g' then '["Strong household tea blend", "Packed for daily brewing", "Good for multiple servings across the week"]'::jsonb
    when 'Dish Wash Liquid 1L' then '["Kitchen cleaning essential", "Sized for repeat daily use", "Designed for regular sink-side cleanup"]'::jsonb
    else '[]'::jsonb
  end,
  ingredients = case title
    when 'Nadu Rice 5kg' then '["Nadu rice"]'::jsonb
    when 'Ceylon Tea 400g' then '["Ceylon black tea"]'::jsonb
    when 'Dish Wash Liquid 1L' then '["Cleaning surfactants", "Fragrance blend", "Water-based solution"]'::jsonb
    else '[]'::jsonb
  end,
  gallery_images = case title
    when 'Nadu Rice 5kg' then '[
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=900&q=80"
    ]'::jsonb
    when 'Ceylon Tea 400g' then '[
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80"
    ]'::jsonb
    when 'Dish Wash Liquid 1L' then '[
      "https://images.unsplash.com/photo-1583947582886-f40ec95dd752?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80"
    ]'::jsonb
    else '[]'::jsonb
  end,
  usage_notes = case title
    when 'Nadu Rice 5kg' then 'Rinse before cooking and use for everyday rice dishes, meal prep, or family-size servings.'
    when 'Ceylon Tea 400g' then 'Brew a measured portion in hot water and adjust strength to suit black tea or milk tea preparation.'
    when 'Dish Wash Liquid 1L' then 'Use a small amount with water or directly on a sponge for plates, cookware, and everyday kitchen washing.'
    else ''
  end,
  storage_notes = case title
    when 'Nadu Rice 5kg' then 'Store sealed in a cool, dry place away from moisture after opening.'
    when 'Ceylon Tea 400g' then 'Keep tightly sealed away from humidity and strong odors to preserve freshness.'
    when 'Dish Wash Liquid 1L' then 'Store upright in a cool indoor area and keep away from direct sunlight.'
    else ''
  end
where seller_id = '00000000-0000-0000-0000-000000000201';

insert into public.orders (
  id,
  customer_id,
  seller_id,
  delivery_rider_id,
  status,
  delivery_status,
  total_cents,
  currency,
  recipient_name,
  delivery_address,
  delivery_address_line_1,
  delivery_address_line_2,
  delivery_city,
  delivery_postal_code,
  delivery_latitude,
  delivery_longitude,
  notes,
  created_at,
  updated_at
)
values
  (
    '30000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000301',
    'processing',
    'assigned',
    337000,
    'LKR',
    'Nethmi Perera',
    '12 Lake Road, Colombo 08',
    '12 Lake Road',
    '',
    'Colombo 08',
    '00800',
    6.914700,
    79.877000,
    'Call on arrival.',
    '2026-03-04T09:30:00Z',
    '2026-03-04T09:30:00Z'
  );

insert into public.order_items (
  id,
  order_id,
  seller_product_id,
  title_snapshot,
  image_url_snapshot,
  quantity,
  price_cents,
  created_at
)
values
  (
    '40000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'Nadu Rice 5kg',
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=80',
    1,
    245000,
    '2026-03-04T09:30:00Z'
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000002',
    'Ceylon Tea 400g',
    'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=900&q=80',
    1,
    92000,
    '2026-03-04T09:30:00Z'
  );

insert into public.delivery_tasks (
  id,
  order_id,
  rider_id,
  status,
  created_at,
  updated_at
)
values
  (
    '50000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000301',
    'assigned',
    '2026-03-04T09:45:00Z',
    '2026-03-04T09:45:00Z'
  );
