begin;

with seller_scope as (
  select '9a5e11b1-8f1c-48b4-aaa2-ab200446cb16'::uuid as seller_id
),
seller_orders as (
  select o.id
  from public.orders o
  join seller_scope s on s.seller_id = o.seller_id
),
deleted_delivery_tasks as (
  delete from public.delivery_tasks dt
  using seller_orders so
  where dt.order_id = so.id
  returning dt.id
),
deleted_order_items as (
  delete from public.order_items oi
  using seller_orders so
  where oi.order_id = so.id
  returning oi.id
),
deleted_orders as (
  delete from public.orders o
  using seller_scope s
  where o.seller_id = s.seller_id
  returning o.id
),
deleted_products as (
  delete from public.seller_products sp
  using seller_scope s
  where sp.seller_id = s.seller_id
  returning sp.id
),
category_seed as (
  select *
  from (values
    (
      'groceries',
      array[
        'Basmati Rice 5kg',
        'Red Rice 5kg',
        'White Sugar 1kg',
        'Brown Sugar 1kg',
        'Sea Salt 1kg',
        'Wheat Flour 1kg',
        'Red Lentils 1kg',
        'Chickpeas 1kg',
        'Green Gram 1kg',
        'Coconut Oil 750ml',
        'Sunflower Oil 1L',
        'Oats 1kg',
        'Corn Flakes 500g',
        'Pasta Penne 500g',
        'Spaghetti 500g',
        'Peanut Butter 340g',
        'Strawberry Jam 450g',
        'Tomato Ketchup 500ml',
        'Curry Powder 250g',
        'Black Pepper 100g'
      ]::text[],
      array[
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1603048719539-9ecb4dc6e7f2?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80'
      ]::text[],
      36000,
      6200,
      18
    ),
    (
      'fresh-produce',
      array[
        'Bananas 1kg',
        'Apples 1kg',
        'Oranges 1kg',
        'Mangoes 1kg',
        'Pineapple Whole',
        'Papaya Whole',
        'Carrots 500g',
        'Potatoes 1kg',
        'Onions 1kg',
        'Tomatoes 500g',
        'Green Beans 250g',
        'Cabbage Whole',
        'Cucumbers 500g',
        'Eggplant 500g',
        'Pumpkin Wedges 1kg',
        'Lettuce Head',
        'Spinach Bundle',
        'Garlic 250g',
        'Ginger 250g',
        'Lemons 500g'
      ]::text[],
      array[
        'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=900&q=80'
      ]::text[],
      28000,
      2800,
      24
    ),
    (
      'dairy-eggs',
      array[
        'Fresh Milk 1L',
        'Chocolate Milk 1L',
        'Yogurt Cup 500g',
        'Greek Yogurt 400g',
        'Butter 250g',
        'Cheese Slices 200g',
        'Mozzarella 200g',
        'Curd Tub 500g',
        'Fresh Cream 200ml',
        'Condensed Milk 390g',
        'UHT Milk 1L',
        'Whipping Cream 250ml',
        'Ghee 500g',
        'Eggs 10 Pack',
        'Eggs 30 Pack',
        'Cottage Cheese 200g',
        'Vanilla Yogurt 450g',
        'Strawberry Yogurt 450g',
        'Paneer 200g',
        'Milk Powder 400g'
      ]::text[],
      array[
        'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=900&q=80'
      ]::text[],
      42000,
      4500,
      16
    ),
    (
      'bakery',
      array[
        'Sandwich Bread Loaf',
        'Whole Wheat Bread Loaf',
        'Burger Buns 6 Pack',
        'Hot Dog Buns 6 Pack',
        'Croissants 4 Pack',
        'Butter Cake 500g',
        'Chocolate Muffins 4 Pack',
        'Plain Donuts 6 Pack',
        'Cinnamon Rolls 4 Pack',
        'Garlic Bread 250g',
        'Pita Bread 5 Pack',
        'Flatbread Pack',
        'Breadsticks 200g',
        'Fruit Bun 6 Pack',
        'Tea Buns 6 Pack',
        'Sliced Cake 300g',
        'Brown Bread Loaf',
        'Multigrain Bread Loaf',
        'Cupcakes 4 Pack',
        'Puff Pastry Sheets'
      ]::text[],
      array[
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=900&q=80'
      ]::text[],
      32000,
      3900,
      15
    ),
    (
      'meat-seafood',
      array[
        'Chicken Breast 500g',
        'Chicken Curry Cut 1kg',
        'Chicken Sausages 500g',
        'Beef Curry Cut 500g',
        'Mutton Curry Cut 500g',
        'Minced Chicken 500g',
        'Minced Beef 500g',
        'Fish Fillets 500g',
        'Seer Fish Steaks 500g',
        'Prawns 500g',
        'Canned Tuna 185g',
        'Chicken Meatballs 500g',
        'Smoked Sausages 340g',
        'Bacon Strips 200g',
        'Chicken Nuggets 500g',
        'Fish Fingers 500g',
        'Crab Meat 250g',
        'Dried Sprats 250g',
        'Anchovy Pack 200g',
        'Seafood Mix 500g'
      ]::text[],
      array[
        'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1510130387422-82bed34b37e9?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=900&q=80'
      ]::text[],
      68000,
      8200,
      12
    ),
    (
      'beverages',
      array[
        'Ceylon Tea 400g',
        'Green Tea 100 Bags',
        'Instant Coffee 200g',
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
        'King Coconut Water 350ml',
        'Cold Brew Coffee 250ml',
        'Hot Chocolate Mix 250g',
        'Drinking Chocolate 400g',
        'Tonic Water 500ml',
        'Rose Milk 1L'
      ]::text[],
      array[
        'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1510626176961-4b57d4fbad03?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1600271886742-f049cd5bba3f?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&w=900&q=80'
      ]::text[],
      22000,
      5400,
      20
    ),
    (
      'snacks',
      array[
        'Potato Chips 150g',
        'Cassava Chips 200g',
        'Cheese Crackers 200g',
        'Salted Peanuts 250g',
        'Mixed Nuts 250g',
        'Trail Mix 200g',
        'Chocolate Cookies 300g',
        'Oat Biscuits 300g',
        'Wafer Rolls 250g',
        'Popcorn 100g',
        'Pretzels 200g',
        'Nacho Chips 200g',
        'Salsa Dip 250g',
        'Granola Bars 6 Pack',
        'Protein Bars 4 Pack',
        'Fruit Gummies 200g',
        'Toffee Pack 250g',
        'Dark Chocolate 100g',
        'Milk Chocolate 100g',
        'Marshmallows 200g'
      ]::text[],
      array[
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1615485925873-6b0f3b56d2fd?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=900&q=80'
      ]::text[],
      18000,
      3100,
      22
    ),
    (
      'frozen-foods',
      array[
        'Frozen Peas 500g',
        'Frozen Mixed Vegetables 500g',
        'Frozen Corn 500g',
        'Frozen Paratha 5 Pack',
        'Frozen Sausages 500g',
        'Frozen Chicken Nuggets 500g',
        'Frozen Fish Fingers 500g',
        'Frozen French Fries 1kg',
        'Frozen Spring Rolls 20 Pack',
        'Ice Cream Vanilla 1L',
        'Ice Cream Chocolate 1L',
        'Ice Cream Strawberry 1L',
        'Frozen Berries 300g',
        'Frozen Prawns 500g',
        'Frozen Meatballs 500g',
        'Frozen Pizza Margherita',
        'Frozen Pizza Chicken',
        'Frozen Roti 10 Pack',
        'Frozen Dumplings 20 Pack',
        'Frozen Desserts Pack'
      ]::text[],
      array[
        'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=900&q=80'
      ]::text[],
      26000,
      5200,
      14
    ),
    (
      'household',
      array[
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
        'Latex Gloves 20 Pack'
      ]::text[],
      array[
        'https://images.unsplash.com/photo-1583947582886-f40ec95dd752?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=900&q=80'
      ]::text[],
      29000,
      6100,
      16
    ),
    (
      'personal-care',
      array[
        'Shampoo 400ml',
        'Conditioner 400ml',
        'Body Wash 500ml',
        'Face Wash 150ml',
        'Hand Cream 100ml',
        'Body Lotion 250ml',
        'Deodorant Spray 150ml',
        'Roll On Deodorant 50ml',
        'Toothpaste 120g',
        'Toothbrush 2 Pack',
        'Mouthwash 500ml',
        'Shaving Cream 200ml',
        'Razor 4 Pack',
        'Face Moisturizer 100ml',
        'Lip Balm 10g',
        'Sunscreen SPF50 100ml',
        'Hair Oil 200ml',
        'Bath Soap 4 Pack',
        'Wet Wipes 80 Pack',
        'Sanitary Pads 10 Pack'
      ]::text[],
      array[
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80'
      ]::text[],
      24000,
      4300,
      18
    ),
    (
      'baby-kids',
      array[
        'Baby Diapers Small Pack',
        'Baby Diapers Medium Pack',
        'Baby Diapers Large Pack',
        'Baby Wipes 80 Pack',
        'Baby Lotion 200ml',
        'Baby Shampoo 200ml',
        'Baby Wash 200ml',
        'Baby Powder 200g',
        'Feeding Bottle 250ml',
        'Baby Cereal 300g',
        'Baby Formula 400g',
        'Kids Toothpaste 50g',
        'Kids Toothbrush 2 Pack',
        'Baby Rash Cream 75g',
        'Pacifier 2 Pack',
        'Baby Bib 3 Pack',
        'Kids Snack Pack',
        'Baby Oil 200ml',
        'Kids Shampoo 200ml',
        'Baby Bath Towel'
      ]::text[],
      array[
        'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1519238359922-989348752efb?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1544396821-4dd40b9387f3?auto=format&fit=crop&w=900&q=80'
      ]::text[],
      26000,
      4800,
      15
    ),
    (
      'pet-supplies',
      array[
        'Dry Dog Food 2kg',
        'Dry Cat Food 1kg',
        'Dog Treats 250g',
        'Cat Treats 100g',
        'Pet Shampoo 250ml',
        'Cat Litter 5kg',
        'Puppy Pads 20 Pack',
        'Dog Leash Medium',
        'Cat Toy Ball Set',
        'Pet Food Bowl',
        'Pet Water Bowl',
        'Bird Seed 500g',
        'Fish Food 100g',
        'Pet Wipes 60 Pack',
        'Flea Powder 100g',
        'Pet Comb',
        'Dog Collar Medium',
        'Cat Collar Small',
        'Pet Bed Small',
        'Pet Carrier Medium'
      ]::text[],
      array[
        'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80'
      ]::text[],
      23000,
      5200,
      12
    ),
    (
      'health-wellness',
      array[
        'Multivitamin Tablets 30 Pack',
        'Vitamin C 500mg 30 Pack',
        'Omega 3 Capsules 30 Pack',
        'Protein Powder 500g',
        'Electrolyte Sachets 10 Pack',
        'Herbal Tea Relax 20 Bags',
        'Sleep Tea 20 Bags',
        'First Aid Kit Compact',
        'Digital Thermometer',
        'Blood Pressure Monitor',
        'Hot Water Bag',
        'Ice Gel Pack',
        'Joint Support Capsules 30 Pack',
        'Fitness Resistance Band',
        'Yoga Mat',
        'Massage Oil 200ml',
        'Hand Grip Exerciser',
        'Knee Support Pair',
        'Elastic Bandage 2 Pack',
        'Wellness Gummies 60 Pack'
      ]::text[],
      array[
        'https://images.unsplash.com/photo-1576671081837-49000212a370?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80'
      ]::text[],
      34000,
      6400,
      10
    ),
    (
      'pharmacy',
      array[
        'Pain Relief Tablets 20 Pack',
        'Cough Syrup 100ml',
        'Antacid Tablets 20 Pack',
        'Allergy Relief Tablets 20 Pack',
        'Nasal Spray 20ml',
        'Vapor Rub 25g',
        'Oral Rehydration Salts 10 Pack',
        'Medical Mask 20 Pack',
        'Surgical Gloves 20 Pack',
        'Antiseptic Liquid 100ml',
        'Wound Dressing 10 Pack',
        'Adhesive Bandage 50 Pack',
        'Cotton Roll 100g',
        'Gauze Pads 20 Pack',
        'Digital Thermometer Basic',
        'Hot Cold Patch 5 Pack',
        'Saline Solution 100ml',
        'Inhaler Spacer',
        'Eye Drops 10ml',
        'Medical Tape 2 Pack'
      ]::text[],
      array[
        'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1576671414121-aa0c81c8695e?auto=format&fit=crop&w=900&q=80'
      ]::text[],
      18000,
      5200,
      20
    ),
    (
      'electronics-accessories',
      array[
        'USB Cable Type C',
        'USB Cable Lightning',
        'Fast Charger 20W',
        'Power Bank 10000mAh',
        'Earphones Wired',
        'Bluetooth Speaker Mini',
        'LED Bulb Smart 12W',
        'Extension Cord 4 Socket',
        'AA Batteries 4 Pack',
        'AAA Batteries 4 Pack',
        'HDMI Cable 1.5m',
        'Phone Holder Stand',
        'Screen Cleaner Kit',
        'Wireless Mouse',
        'Keyboard Compact',
        'Portable Flash Drive 64GB',
        'Travel Adapter',
        'Desk Lamp LED',
        'Rechargeable Torch',
        'Car Charger USB'
      ]::text[],
      array[
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=80'
      ]::text[],
      26000,
      7600,
      9
    ),
    (
      'office-stationery',
      array[
        'A4 Copier Paper 500 Sheets',
        'Notebook Ruled A5',
        'Notebook Plain A4',
        'Ballpoint Pens 10 Pack',
        'Gel Pens 5 Pack',
        'Permanent Markers 4 Pack',
        'Highlighters 4 Pack',
        'Sticky Notes Set',
        'Stapler Medium',
        'Staples 1000 Pack',
        'Paper Clips 100 Pack',
        'File Folder 5 Pack',
        'Brown Envelope 10 Pack',
        'Scissors Office',
        'Glue Stick 2 Pack',
        'Correction Tape 2 Pack',
        'Desk Organizer',
        'Whiteboard Markers 4 Pack',
        'Sketchbook A4',
        'Printer Ink Black'
      ]::text[],
      array[
        'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1494173853739-c21f58b16055?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=900&q=80'
      ]::text[],
      14000,
      2700,
      18
    ),
    (
      'home-living',
      array[
        'Storage Box 20L',
        'Storage Basket Large',
        'Laundry Basket Medium',
        'Cushion Cover Set',
        'Bedsheet Set Queen',
        'Bath Towel 2 Pack',
        'Floor Mat',
        'Curtains Pair',
        'Hangers 10 Pack',
        'Shoe Rack 3 Tier',
        'Table Lamp Classic',
        'LED Night Light',
        'Scented Candles 3 Pack',
        'Wall Hooks 6 Pack',
        'Vase Ceramic Medium',
        'Blanket Fleece',
        'Pillow Pair',
        'Dining Placemats 4 Pack',
        'Trash Bin 15L',
        'Air Freshener 300ml'
      ]::text[],
      array[
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80'
      ]::text[],
      22000,
      5900,
      12
    ),
    (
      'adult-wellness',
      array[
        'Condoms 12 Pack',
        'Lubricant Water Based 100ml',
        'Massage Oil Sensual 200ml',
        'Intimate Wash 200ml',
        'Pregnancy Test Kit 2 Pack',
        'Feminine Wipes 20 Pack',
        'Menstrual Cup',
        'Adult Vitamins 30 Pack',
        'Relaxation Candles 3 Pack',
        'Aromatherapy Oil 30ml',
        'Personal Massager Compact',
        'Heating Pad Mini',
        'Bath Salts 500g',
        'Wellness Tea Blend 20 Bags',
        'Silk Eye Mask',
        'Scent Diffuser Mini',
        'Couples Massage Kit',
        'Hand Cream Luxury 100ml',
        'Night Recovery Balm 50g',
        'Body Mist 150ml'
      ]::text[],
      array[
        'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80'
      ]::text[],
      26000,
      6800,
      10
    )
  ) as seed(slug, titles, image_pool, price_base, price_step, inventory_base)
),
expanded_catalog as (
  select
    s.seller_id,
    c.id as category_id,
    c.name as category_name,
    c.slug as category_slug,
    item.title,
    item.position,
    seed.image_pool,
    seed.price_base,
    seed.price_step,
    seed.inventory_base,
    row_number() over (order by c.sort_order, item.position) as sort_order
  from seller_scope s
  join category_seed seed on true
  join public.categories c on c.slug = seed.slug
  cross join lateral unnest(seed.titles) with ordinality as item(title, position)
),
catalog as (
  select
    seller_id,
    category_id,
    title,
    category_name,
    category_slug,
    sort_order,
    image_pool[1 + ((position - 1) % array_length(image_pool, 1))] as image_url,
    image_pool[1 + ((position) % array_length(image_pool, 1))] as gallery_alt_1,
    image_pool[1 + ((position + 1) % array_length(image_pool, 1))] as gallery_alt_2,
    price_base + ((position - 1) * price_step) as price_cents,
    inventory_base + (((position - 1) % 6) * 4) as inventory_count
  from expanded_catalog
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
  trim(both '-' from regexp_replace(lower(title || '-seller-9a5e11b1'), '[^a-z0-9]+', '-', 'g')),
  category_name || ' item selected for repeat store orders and everyday customer shopping.' as description,
  format(
    '%s is listed under %s as a repeat-buy item for customers who want dependable everyday shopping options. This listing is positioned to feel practical, easy to reorder, and suitable for regular household or personal use depending on the category.',
    title,
    category_name
  ) as long_description,
  jsonb_build_array(
    category_name || ' essential',
    'Suitable for repeat orders',
    'Store-ready listing'
  ) as details,
  jsonb_build_array(
    regexp_replace(title, '\s+\d.*$', ''),
    category_name || ' product'
  ) as ingredients,
  jsonb_build_array(
    image_url,
    gallery_alt_1,
    gallery_alt_2
  ) as gallery_images,
  format(
    'Use %s according to the intended %s purpose and routine customer needs.',
    title,
    lower(category_name)
  ) as usage_notes,
  format(
    'Store %s in a clean, dry, and category-appropriate place for best everyday use.',
    title
  ) as storage_notes,
  price_cents,
  'LKR',
  image_url,
  inventory_count,
  sort_order
from catalog
order by sort_order;

commit;
