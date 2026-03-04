create extension if not exists pgcrypto;

drop table if exists public.delivery_tasks cascade;
drop table if exists public.order_items cascade;
drop table if exists public.orders cascade;
drop table if exists public.seller_products cascade;
drop table if exists public.categories cascade;
drop table if exists public.profiles cascade;

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
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
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'LKR',
  image_url text not null default '',
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
    delivery_status in ('awaiting_assignment', 'assigned', 'picked_up', 'in_transit', 'delivered')
  ),
  total_cents integer not null check (total_cents >= 0),
  currency text not null default 'LKR',
  recipient_name text not null default '',
  delivery_address text not null,
  delivery_latitude double precision,
  delivery_longitude double precision,
  notes text not null default '',
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
  email,
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
    'customer@sahanz.store',
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
        "latitude": 6.914700,
        "longitude": 79.877000,
        "is_default": true
      },
      {
        "id": "addr-office",
        "label": "Office",
        "recipient_name": "Nethmi Perera",
        "address": "75 Union Place, Colombo 02",
        "latitude": 6.917200,
        "longitude": 79.861100,
        "is_default": false
      }
    ]'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000201',
    'seller@sahanz.store',
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
    'delivery@sahanz.store',
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
  ('10000000-0000-0000-0000-000000000002', 'Beverages', 'beverages', 2),
  ('10000000-0000-0000-0000-000000000003', 'Household', 'household', 3);

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
