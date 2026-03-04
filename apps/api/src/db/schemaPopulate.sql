begin;

-- Clear product-dependent data before replacing the catalog.
delete from public.delivery_tasks;
delete from public.order_items;
delete from public.orders;
delete from public.seller_products;

with grocery_seed as (
  select title, ordinality as position
  from unnest(array[
    'Basmati Rice 5kg',
    'Red Samba Rice 5kg',
    'White Sugar 1kg',
    'Brown Sugar 1kg',
    'Sea Salt 1kg',
    'Coconut Flour 500g',
    'Chickpeas 1kg',
    'Red Lentils 1kg',
    'Green Gram 1kg',
    'Wheat Flour 1kg',
    'Jaggery Cubes 500g',
    'Dry Chillies 250g',
    'Turmeric Powder 200g',
    'Curry Powder 250g',
    'Black Pepper 100g',
    'Cinnamon Sticks 100g',
    'Cardamom 50g',
    'Mustard Seeds 100g',
    'Cumin Seeds 100g',
    'Fennel Seeds 100g',
    'Coconut Oil 750ml',
    'Sesame Oil 500ml',
    'Sunflower Oil 1L',
    'Ghee 500g',
    'Tomato Ketchup 500ml',
    'Soy Sauce 250ml',
    'Pasta Penne 500g',
    'Spaghetti 500g',
    'Oats 1kg',
    'Corn Flakes 500g',
    'Peanut Butter 340g',
    'Strawberry Jam 450g',
    'Marmalade 450g',
    'Biscuits Family Pack'
  ]::text[]) with ordinality as seed(title, ordinality)
),
grocery_images as (
  select *
  from (values
    ('Basmati Rice 5kg', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=80'),
    ('Red Samba Rice 5kg', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=80'),
    ('White Sugar 1kg', 'https://images.unsplash.com/photo-1515543904379-3d757afe72e3?auto=format&fit=crop&w=900&q=80'),
    ('Brown Sugar 1kg', 'https://images.unsplash.com/photo-1515543904379-3d757afe72e3?auto=format&fit=crop&w=900&q=80'),
    ('Sea Salt 1kg', 'https://images.unsplash.com/photo-1573246123716-6b1782bfc499?auto=format&fit=crop&w=900&q=80'),
    ('Coconut Flour 500g', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80'),
    ('Chickpeas 1kg', 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80'),
    ('Red Lentils 1kg', 'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=900&q=80'),
    ('Green Gram 1kg', 'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=900&q=80'),
    ('Wheat Flour 1kg', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80'),
    ('Jaggery Cubes 500g', 'https://images.unsplash.com/photo-1615485925873-6b0f3b56d2fd?auto=format&fit=crop&w=900&q=80'),
    ('Dry Chillies 250g', 'https://images.unsplash.com/photo-1573246123716-6b1782bfc499?auto=format&fit=crop&w=900&q=80'),
    ('Turmeric Powder 200g', 'https://images.unsplash.com/photo-1573246123716-6b1782bfc499?auto=format&fit=crop&w=900&q=80'),
    ('Curry Powder 250g', 'https://images.unsplash.com/photo-1573246123716-6b1782bfc499?auto=format&fit=crop&w=900&q=80'),
    ('Black Pepper 100g', 'https://images.unsplash.com/photo-1573246123716-6b1782bfc499?auto=format&fit=crop&w=900&q=80'),
    ('Cinnamon Sticks 100g', 'https://images.unsplash.com/photo-1573246123716-6b1782bfc499?auto=format&fit=crop&w=900&q=80'),
    ('Cardamom 50g', 'https://images.unsplash.com/photo-1573246123716-6b1782bfc499?auto=format&fit=crop&w=900&q=80'),
    ('Mustard Seeds 100g', 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80'),
    ('Cumin Seeds 100g', 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80'),
    ('Fennel Seeds 100g', 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80'),
    ('Coconut Oil 750ml', 'https://images.unsplash.com/photo-1603048719539-9ecb4dc6e7f2?auto=format&fit=crop&w=900&q=80'),
    ('Sesame Oil 500ml', 'https://images.unsplash.com/photo-1603048719539-9ecb4dc6e7f2?auto=format&fit=crop&w=900&q=80'),
    ('Sunflower Oil 1L', 'https://images.unsplash.com/photo-1603048719539-9ecb4dc6e7f2?auto=format&fit=crop&w=900&q=80'),
    ('Ghee 500g', 'https://images.unsplash.com/photo-1603048719539-9ecb4dc6e7f2?auto=format&fit=crop&w=900&q=80'),
    ('Tomato Ketchup 500ml', 'https://images.unsplash.com/photo-1615485925873-6b0f3b56d2fd?auto=format&fit=crop&w=900&q=80'),
    ('Soy Sauce 250ml', 'https://images.unsplash.com/photo-1615485925873-6b0f3b56d2fd?auto=format&fit=crop&w=900&q=80'),
    ('Pasta Penne 500g', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80'),
    ('Spaghetti 500g', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80'),
    ('Oats 1kg', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80'),
    ('Corn Flakes 500g', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80'),
    ('Peanut Butter 340g', 'https://images.unsplash.com/photo-1615485925873-6b0f3b56d2fd?auto=format&fit=crop&w=900&q=80'),
    ('Strawberry Jam 450g', 'https://images.unsplash.com/photo-1615485925873-6b0f3b56d2fd?auto=format&fit=crop&w=900&q=80'),
    ('Marmalade 450g', 'https://images.unsplash.com/photo-1615485925873-6b0f3b56d2fd?auto=format&fit=crop&w=900&q=80'),
    ('Biscuits Family Pack', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80')
  ) as image_map(title, image_url)
),
beverage_seed as (
  select title, ordinality as position
  from unnest(array[
    'Ceylon Tea 400g',
    'Green Tea 100 Bags',
    'Instant Coffee 200g',
    'Fresh Milk 1L',
    'Chocolate Milk 1L',
    'Orange Juice 1L',
    'Apple Juice 1L',
    'Mango Juice 1L',
    'Mineral Water 1.5L',
    'Sparkling Water 750ml',
    'Soda 1.5L',
    'Ginger Beer 330ml',
    'Lemonade 1L',
    'Iced Tea Peach 500ml',
    'Energy Drink 250ml',
    'Sports Drink 500ml',
    'Yoghurt Drink 180ml',
    'Vanilla Milkshake 250ml',
    'Faluda Drink 250ml',
    'Wood Apple Juice 500ml',
    'King Coconut Water 350ml',
    'Cold Brew Coffee 250ml',
    'Herbal Tea Mix 50g',
    'Hot Chocolate Mix 250g',
    'Drinking Chocolate 400g',
    'Barley Drink 1L',
    'Cream Soda 1.5L',
    'Tonic Water 500ml',
    'Cranberry Juice 1L',
    'Pineapple Juice 1L',
    'Passion Fruit Juice 1L',
    'Faluda Syrup 750ml',
    'Rose Milk 1L'
  ]::text[]) with ordinality as seed(title, ordinality)
),
beverage_images as (
  select *
  from (values
    ('Ceylon Tea 400g', 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=900&q=80'),
    ('Green Tea 100 Bags', 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=900&q=80'),
    ('Instant Coffee 200g', 'https://images.unsplash.com/photo-1510626176961-4b57d4fbad03?auto=format&fit=crop&w=900&q=80'),
    ('Fresh Milk 1L', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=900&q=80'),
    ('Chocolate Milk 1L', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=900&q=80'),
    ('Orange Juice 1L', 'https://images.unsplash.com/photo-1600271886742-f049cd5bba3f?auto=format&fit=crop&w=900&q=80'),
    ('Apple Juice 1L', 'https://images.unsplash.com/photo-1600271886742-f049cd5bba3f?auto=format&fit=crop&w=900&q=80'),
    ('Mango Juice 1L', 'https://images.unsplash.com/photo-1600271886742-f049cd5bba3f?auto=format&fit=crop&w=900&q=80'),
    ('Mineral Water 1.5L', 'https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&w=900&q=80'),
    ('Sparkling Water 750ml', 'https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&w=900&q=80'),
    ('Soda 1.5L', 'https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=900&q=80'),
    ('Ginger Beer 330ml', 'https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=900&q=80'),
    ('Lemonade 1L', 'https://images.unsplash.com/photo-1600271886742-f049cd5bba3f?auto=format&fit=crop&w=900&q=80'),
    ('Iced Tea Peach 500ml', 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=900&q=80'),
    ('Energy Drink 250ml', 'https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=900&q=80'),
    ('Sports Drink 500ml', 'https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=900&q=80'),
    ('Yoghurt Drink 180ml', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=900&q=80'),
    ('Vanilla Milkshake 250ml', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=900&q=80'),
    ('Faluda Drink 250ml', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80'),
    ('Wood Apple Juice 500ml', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80'),
    ('King Coconut Water 350ml', 'https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&w=900&q=80'),
    ('Cold Brew Coffee 250ml', 'https://images.unsplash.com/photo-1510626176961-4b57d4fbad03?auto=format&fit=crop&w=900&q=80'),
    ('Herbal Tea Mix 50g', 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=900&q=80'),
    ('Hot Chocolate Mix 250g', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80'),
    ('Drinking Chocolate 400g', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80'),
    ('Barley Drink 1L', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80'),
    ('Cream Soda 1.5L', 'https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=900&q=80'),
    ('Tonic Water 500ml', 'https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&w=900&q=80'),
    ('Cranberry Juice 1L', 'https://images.unsplash.com/photo-1600271886742-f049cd5bba3f?auto=format&fit=crop&w=900&q=80'),
    ('Pineapple Juice 1L', 'https://images.unsplash.com/photo-1600271886742-f049cd5bba3f?auto=format&fit=crop&w=900&q=80'),
    ('Passion Fruit Juice 1L', 'https://images.unsplash.com/photo-1600271886742-f049cd5bba3f?auto=format&fit=crop&w=900&q=80'),
    ('Faluda Syrup 750ml', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80'),
    ('Rose Milk 1L', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=900&q=80')
  ) as image_map(title, image_url)
),
household_seed as (
  select title, ordinality as position
  from unnest(array[
    'Dish Wash Liquid 1L',
    'Laundry Detergent 2kg',
    'Fabric Softener 1L',
    'Multipurpose Cleaner 500ml',
    'Floor Cleaner 1L',
    'Glass Cleaner 500ml',
    'Bathroom Cleaner 750ml',
    'Toilet Cleaner 750ml',
    'Bleach 1L',
    'Disinfectant 1L',
    'Hand Wash Refill 500ml',
    'Hand Sanitizer 250ml',
    'Kitchen Towels 2 Pack',
    'Tissue Roll Pack',
    'Garbage Bags Large',
    'Aluminium Foil 25m',
    'Cling Wrap 30m',
    'Scrub Pads 3 Pack',
    'Microfiber Cloth 2 Pack',
    'Mop Refill Head',
    'Broom Soft Bristle',
    'Dustpan Set',
    'Laundry Basket Medium',
    'Storage Box 20L',
    'Air Freshener 300ml',
    'Mosquito Repellent 45ml',
    'Insect Spray 400ml',
    'Matches 5 Pack',
    'Candles 10 Pack',
    'Batteries AA 4 Pack',
    'Light Bulb LED 12W',
    'Sponge Wipes 5 Pack',
    'Latex Gloves 20 Pack'
  ]::text[]) with ordinality as seed(title, ordinality)
),
household_images as (
  select *
  from (values
    ('Dish Wash Liquid 1L', 'https://images.unsplash.com/photo-1583947582886-f40ec95dd752?auto=format&fit=crop&w=900&q=80'),
    ('Laundry Detergent 2kg', 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=900&q=80'),
    ('Fabric Softener 1L', 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=900&q=80'),
    ('Multipurpose Cleaner 500ml', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80'),
    ('Floor Cleaner 1L', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80'),
    ('Glass Cleaner 500ml', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80'),
    ('Bathroom Cleaner 750ml', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80'),
    ('Toilet Cleaner 750ml', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80'),
    ('Bleach 1L', 'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=900&q=80'),
    ('Disinfectant 1L', 'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=900&q=80'),
    ('Hand Wash Refill 500ml', 'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?auto=format&fit=crop&w=900&q=80'),
    ('Hand Sanitizer 250ml', 'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?auto=format&fit=crop&w=900&q=80'),
    ('Kitchen Towels 2 Pack', 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=900&q=80'),
    ('Tissue Roll Pack', 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=900&q=80'),
    ('Garbage Bags Large', 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=900&q=80'),
    ('Aluminium Foil 25m', 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=900&q=80'),
    ('Cling Wrap 30m', 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=900&q=80'),
    ('Scrub Pads 3 Pack', 'https://images.unsplash.com/photo-1583947582886-f40ec95dd752?auto=format&fit=crop&w=900&q=80'),
    ('Microfiber Cloth 2 Pack', 'https://images.unsplash.com/photo-1583947582886-f40ec95dd752?auto=format&fit=crop&w=900&q=80'),
    ('Mop Refill Head', 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=900&q=80'),
    ('Broom Soft Bristle', 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=900&q=80'),
    ('Dustpan Set', 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=900&q=80'),
    ('Laundry Basket Medium', 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=900&q=80'),
    ('Storage Box 20L', 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=900&q=80'),
    ('Air Freshener 300ml', 'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=900&q=80'),
    ('Mosquito Repellent 45ml', 'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?auto=format&fit=crop&w=900&q=80'),
    ('Insect Spray 400ml', 'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?auto=format&fit=crop&w=900&q=80'),
    ('Matches 5 Pack', 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=900&q=80'),
    ('Candles 10 Pack', 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=900&q=80'),
    ('Batteries AA 4 Pack', 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=900&q=80'),
    ('Light Bulb LED 12W', 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=900&q=80'),
    ('Sponge Wipes 5 Pack', 'https://images.unsplash.com/photo-1583947582886-f40ec95dd752?auto=format&fit=crop&w=900&q=80'),
    ('Latex Gloves 20 Pack', 'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?auto=format&fit=crop&w=900&q=80')
  ) as image_map(title, image_url)
),
catalog as (
  select
    '00000000-0000-0000-0000-000000000201'::uuid as seller_id,
    '10000000-0000-0000-0000-000000000001'::uuid as category_id,
    title,
    'Fresh pantry essential selected for daily cooking and home kitchens.' as description,
    title || ' is stocked as a practical pantry essential for daily cooking, repeat household shopping, and reliable weekly restocks. This item is positioned as an easy staple for shoppers who want familiar grocery basics that fit regular meal planning, kitchen prep, and day-to-day home use without unnecessary complexity.' as long_description,
    jsonb_build_array(
      'Pantry-ready grocery staple',
      'Suitable for routine household restocking',
      'Packed for regular everyday use'
    ) as details,
    jsonb_build_array(
      case
        when title ilike '%Rice%' then 'Rice grains'
        when title ilike '%Sugar%' then 'Sugar'
        when title ilike '%Salt%' then 'Salt'
        when title ilike '%Flour%' then replace(title, ' 500g', '')
        when title ilike '%Lentils%' then 'Red lentils'
        when title ilike '%Chickpeas%' then 'Chickpeas'
        when title ilike '%Gram%' then 'Green gram'
        when title ilike '%Oil%' then replace(title, ' 750ml', '')
        when title ilike '%Ghee%' then 'Clarified butter'
        when title ilike '%Ketchup%' then 'Tomato-based sauce'
        when title ilike '%Sauce%' then 'Seasoning sauce'
        when title ilike '%Jam%' then 'Fruit spread'
        when title ilike '%Marmalade%' then 'Citrus fruit spread'
        when title ilike '%Oats%' then 'Rolled oats'
        when title ilike '%Corn Flakes%' then 'Corn flakes'
        when title ilike '%Biscuits%' then 'Biscuit mix'
        else replace(title, regexp_replace(title, '.*\s(\d+.*)$', ' \1'), '')
      end
    ) as ingredients,
    jsonb_build_array(
      grocery_images.image_url,
      'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=900&q=80'
    ) as gallery_images,
    'Use ' || title || ' as part of regular pantry prep, home cooking, or repeat weekly kitchen stocking depending on your household routine.' as usage_notes,
    'Store ' || title || ' in a cool, dry place and keep sealed after opening for best day-to-day use.' as storage_notes,
    32000 + ((position - 1) * 6500) as price_cents,
    grocery_images.image_url,
    18 + (((position - 1) % 9) * 3) as inventory_count,
    position as sort_order
  from grocery_seed
  join grocery_images using (title)

  union all

  select
    '00000000-0000-0000-0000-000000000201'::uuid,
    '10000000-0000-0000-0000-000000000002'::uuid,
    title,
    'Ready-to-drink option for breakfast, refreshment, and daily use.',
    title || ' is listed as an easy beverage pick for breakfast tables, quick refreshment, and regular home stocking. It suits shoppers who want grab-and-go drink options that fit everyday routines, casual hosting, and convenient repeat orders without having to search deeply through the catalog.' ,
    jsonb_build_array(
      'Everyday beverage option',
      'Easy for repeat household orders',
      'Fits quick refreshment and pantry top-ups'
    ),
    jsonb_build_array(
      case
        when title ilike '%Tea%' then 'Tea blend'
        when title ilike '%Coffee%' then 'Coffee blend'
        when title ilike '%Milk%' then 'Milk base'
        when title ilike '%Juice%' then 'Fruit juice blend'
        when title ilike '%Water%' then 'Drinking water'
        when title ilike '%Chocolate%' then 'Chocolate beverage mix'
        when title ilike '%Drink%' then 'Flavored drink base'
        when title ilike '%Syrup%' then 'Sweetened syrup base'
        else 'Prepared beverage'
      end
    ),
    jsonb_build_array(
      beverage_images.image_url,
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80'
    ),
    'Serve ' || title || ' chilled or prepared as needed for breakfast, casual refreshment, or everyday drink service.',
    'Keep ' || title || ' stored according to pack type and refrigerate after opening where appropriate.',
    22000 + ((position - 1) * 5400),
    beverage_images.image_url,
    20 + (((position - 1) % 9) * 3),
    34 + position
  from beverage_seed
  join beverage_images using (title)

  union all

  select
    '00000000-0000-0000-0000-000000000201'::uuid,
    '10000000-0000-0000-0000-000000000003'::uuid,
    title,
    'Home care essential stocked for regular cleaning and household upkeep.',
    title || ' is positioned as a reliable household essential for regular cleaning, upkeep, and practical home care routines. It is intended for shoppers who want straightforward products that support repeat use across kitchens, bathrooms, laundry spaces, and other everyday household tasks.',
    jsonb_build_array(
      'Household maintenance essential',
      'Made for repeat home use',
      'Useful for regular cleaning or storage routines'
    ),
    jsonb_build_array(
      case
        when title ilike '%Cleaner%' then 'Cleaning solution'
        when title ilike '%Detergent%' then 'Detergent blend'
        when title ilike '%Softener%' then 'Fabric care solution'
        when title ilike '%Sanitizer%' then 'Sanitizing solution'
        when title ilike '%Tissue%' then 'Soft paper rolls'
        when title ilike '%Towels%' then 'Absorbent paper sheets'
        when title ilike '%Bags%' then 'Plastic bag material'
        when title ilike '%Foil%' then 'Aluminium foil'
        when title ilike '%Wrap%' then 'Food wrap film'
        when title ilike '%Gloves%' then 'Protective glove material'
        else 'Household use materials'
      end
    ),
    jsonb_build_array(
      household_images.image_url,
      'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80'
    ),
    'Use ' || title || ' as part of regular household cleaning, storage, hygiene, or maintenance depending on the intended task.',
    'Store ' || title || ' safely in a cool indoor place and keep away from moisture or direct sunlight when relevant.',
    28000 + ((position - 1) * 7100),
    household_images.image_url,
    14 + (((position - 1) % 9) * 3),
    67 + position
  from household_seed
  join household_images using (title)
)
insert into public.seller_products (
  id,
  seller_id,
  category_id,
  title,
  slug,
  description,
  long_description,
  details,
  ingredients,
  gallery_images,
  usage_notes,
  storage_notes,
  price_cents,
  currency,
  image_url,
  inventory_count,
  sort_order
)
select
  gen_random_uuid(),
  seller_id,
  category_id,
  title,
  trim(both '-' from regexp_replace(lower(title || '-seller-1'), '[^a-z0-9]+', '-', 'g')),
  description,
  long_description,
  details,
  ingredients,
  gallery_images,
  usage_notes,
  storage_notes,
  price_cents,
  'LKR',
  image_url,
  inventory_count,
  sort_order
from catalog
order by sort_order;

commit;
