const { hashPassword, verifyPassword } = require("../lib/auth");

function composeAddress(parts = {}) {
  return [
    parts.addressLine1,
    parts.addressLine2,
    parts.city,
    parts.postalCode
  ]
    .map((entry) => String(entry || "").trim())
    .filter(Boolean)
    .join(", ");
}

const categories = [
  { id: "cat-groceries", name: "Groceries", slug: "groceries", sortOrder: 1 },
  { id: "cat-beverages", name: "Beverages", slug: "beverages", sortOrder: 2 },
  { id: "cat-household", name: "Household", slug: "household", sortOrder: 3 }
];

const users = [
  {
    id: "customer-1",
    username: "nethmi",
    name: "Nethmi Perera",
    email: "customer@sahanz.store",
    passwordHash: hashPassword("Password123!"),
    role: "customer",
    phone: "0770000001",
    address: "12 Lake Road, Colombo 08",
    businessName: "",
    businessAddress: "",
    serviceArea: "Colombo 08",
    vehicleType: "",
    profileNote: "Ring the bell once and call if needed.",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    savedAddresses: [
      {
        id: "addr-home",
        label: "Home",
        recipientName: "Nethmi Perera",
        address: "12 Lake Road, Colombo 08",
        addressLine1: "12 Lake Road",
        addressLine2: "",
        city: "Colombo 08",
        postalCode: "00800",
        latitude: 6.9147,
        longitude: 79.877,
        isDefault: true
      },
      {
        id: "addr-office",
        label: "Office",
        recipientName: "Nethmi Perera",
        address: "75 Union Place, Colombo 02",
        addressLine1: "75 Union Place",
        addressLine2: "",
        city: "Colombo 02",
        postalCode: "00200",
        latitude: 6.9172,
        longitude: 79.8611,
        isDefault: false
      }
    ]
  },
  {
    id: "seller-1",
    username: "sahanzmart",
    name: "Sahanz Mart",
    email: "seller@sahanz.store",
    passwordHash: hashPassword("Password123!"),
    role: "seller",
    phone: "0770000002",
    address: "",
    businessName: "Sahanz Mart",
    businessAddress: "58 Ward Place, Colombo 07",
    serviceArea: "Colombo 01-08",
    vehicleType: "",
    profileNote: "Open daily from 7 AM to 10 PM.",
    avatarUrl:
      "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=400&q=80",
    savedAddresses: []
  },
  {
    id: "delivery-1",
    username: "rashmika",
    name: "Rashmika Rider",
    email: "delivery@sahanz.store",
    passwordHash: hashPassword("Password123!"),
    role: "delivery",
    phone: "0770000003",
    address: "",
    businessName: "",
    businessAddress: "",
    serviceArea: "Colombo Central",
    vehicleType: "Motorbike",
    profileNote: "Prefers pickup batching during busy hours.",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    savedAddresses: []
  }
];

function buildProductContent(product) {
  const galleryImages = Array.from(
    new Set(
      [
        product.imageUrl,
        product.categoryId === "cat-groceries"
          ? "https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=900&q=80"
          : product.categoryId === "cat-beverages"
            ? "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80"
            : "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=900&q=80",
        product.categoryId === "cat-groceries"
          ? "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=900&q=80"
          : product.categoryId === "cat-beverages"
            ? "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80"
            : "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80"
      ].filter(Boolean)
    )
  );

  if (product.categoryId === "cat-groceries") {
    return {
      galleryImages,
      longDescription: `${product.title} is stocked as a practical pantry staple for households that want dependable grocery essentials ready for daily cooking. It suits repeat weekly shopping, regular meal prep, and kitchen restocks, giving shoppers a familiar product that fits smoothly into everyday home routines without feeling like a specialty purchase.`,
      details: [
        "Pantry-ready grocery essential",
        "Easy to reorder for weekly restocks",
        "Suitable for regular household cooking"
      ],
      ingredients: [
        product.title.includes("Rice")
          ? "Rice grains"
          : product.title.includes("Sugar")
            ? "Sugar"
            : product.title.includes("Salt")
              ? "Salt"
              : product.title.includes("Oil")
                ? "Edible oil"
                : product.title.includes("Tea")
                  ? "Tea blend"
                  : product.title.split(" ").slice(0, -1).join(" ")
      ],
      usageNotes: `Use ${product.title} for regular pantry prep, daily cooking, or routine family meal planning.`,
      storageNotes: `Keep ${product.title} sealed and stored in a cool, dry place after opening.`
    };
  }

  if (product.categoryId === "cat-beverages") {
    return {
      galleryImages,
      longDescription: `${product.title} is listed as an easy beverage pick for breakfast tables, quick refreshment, and convenient household top-ups. It fits shoppers who want reliable drinks for regular use, simple hosting, and repeat ordering without having to search through the full storefront every time.`,
      details: [
        "Everyday beverage option",
        "Convenient for repeat household orders",
        "Fits quick refreshment and breakfast use"
      ],
      ingredients: [
        product.title.includes("Tea")
          ? "Tea blend"
          : product.title.includes("Coffee")
            ? "Coffee blend"
            : product.title.includes("Milk")
              ? "Milk base"
              : product.title.includes("Juice")
                ? "Fruit juice blend"
                : product.title.includes("Water")
                  ? "Drinking water"
                  : "Prepared beverage base"
      ],
      usageNotes: `Serve ${product.title} chilled or prepared as needed for daily drinking and quick refreshment.`,
      storageNotes: `Store ${product.title} according to pack type and refrigerate after opening where needed.`
    };
  }

  return {
    galleryImages,
    longDescription: `${product.title} is positioned as a dependable household essential for regular cleaning, maintenance, and day-to-day home care. It supports repeat use across common routines, helping shoppers keep kitchens, laundry areas, bathrooms, or utility spaces stocked with practical products they can come back to confidently.`,
    details: [
      "Household maintenance essential",
      "Made for regular repeat use",
      "Useful across everyday home routines"
    ],
    ingredients: [
      product.title.includes("Cleaner")
        ? "Cleaning solution"
        : product.title.includes("Detergent")
          ? "Detergent blend"
          : product.title.includes("Tissue")
            ? "Soft paper rolls"
            : product.title.includes("Gloves")
              ? "Protective glove material"
              : "Household-use materials"
    ],
    usageNotes: `Use ${product.title} as part of regular household cleaning, storage, hygiene, or upkeep tasks.`,
    storageNotes: `Store ${product.title} in a cool indoor place and keep it away from direct heat or moisture where relevant.`
  };
}

const sellerProducts = [
  {
    id: "listing-1",
    sellerId: "seller-1",
    sellerName: "Sahanz Mart",
    categoryId: "cat-groceries",
    title: "Nadu Rice 5kg",
    slug: "nadu-rice-5kg-seller-1",
    description: "Fresh household rice packed for weekly kitchen use.",
    priceCents: 245000,
    currency: "LKR",
    imageUrl:
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=80",
    inventoryCount: 18,
    isActive: true,
    sortOrder: 1,
    createdAt: "2026-03-01T08:00:00.000Z"
  },
  {
    id: "listing-2",
    sellerId: "seller-1",
    sellerName: "Sahanz Mart",
    categoryId: "cat-beverages",
    title: "Ceylon Tea 400g",
    slug: "ceylon-tea-400g-seller-1",
    description: "Strong breakfast tea blend packed by the seller.",
    priceCents: 92000,
    currency: "LKR",
    imageUrl:
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=900&q=80",
    inventoryCount: 35,
    isActive: true,
    sortOrder: 2,
    createdAt: "2026-03-02T08:00:00.000Z"
  },
  {
    id: "listing-3",
    sellerId: "seller-1",
    sellerName: "Sahanz Mart",
    categoryId: "cat-household",
    title: "Dish Wash Liquid 1L",
    slug: "dish-wash-liquid-1l-seller-1",
    description: "Kitchen-safe cleaning liquid with citrus fragrance.",
    priceCents: 135000,
    currency: "LKR",
    imageUrl:
      "https://images.unsplash.com/photo-1583947582886-f40ec95dd752?auto=format&fit=crop&w=900&q=80",
    inventoryCount: 24,
    isActive: true,
    sortOrder: 3,
    createdAt: "2026-03-03T08:00:00.000Z"
  },
  {
    id: "listing-4",
    sellerId: "seller-1",
    sellerName: "Sahanz Mart",
    categoryId: "cat-groceries",
    title: "Red Lentils 1kg",
    slug: "red-lentils-1kg-seller-1",
    description: "Quick-cooking red lentils for curries, soups, and everyday meals.",
    priceCents: 68000,
    currency: "LKR",
    imageUrl:
      "https://images.unsplash.com/photo-1515543904379-3d757afe72e3?auto=format&fit=crop&w=900&q=80",
    inventoryCount: 42,
    isActive: true,
    sortOrder: 4,
    createdAt: "2026-03-03T10:00:00.000Z"
  },
  {
    id: "listing-5",
    sellerId: "seller-1",
    sellerName: "Sahanz Mart",
    categoryId: "cat-groceries",
    title: "Brown Sugar 1kg",
    slug: "brown-sugar-1kg-seller-1",
    description: "Soft brown sugar for tea, baking, and desserts.",
    priceCents: 54000,
    currency: "LKR",
    imageUrl:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80",
    inventoryCount: 30,
    isActive: true,
    sortOrder: 5,
    createdAt: "2026-03-03T11:00:00.000Z"
  },
  {
    id: "listing-6",
    sellerId: "seller-1",
    sellerName: "Sahanz Mart",
    categoryId: "cat-groceries",
    title: "Coconut Oil 750ml",
    slug: "coconut-oil-750ml-seller-1",
    description: "Pure coconut oil suitable for cooking and light frying.",
    priceCents: 118000,
    currency: "LKR",
    imageUrl:
      "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=900&q=80",
    inventoryCount: 20,
    isActive: true,
    sortOrder: 6,
    createdAt: "2026-03-03T12:00:00.000Z"
  },
  {
    id: "listing-7",
    sellerId: "seller-1",
    sellerName: "Sahanz Mart",
    categoryId: "cat-beverages",
    title: "Fresh Milk 1L",
    slug: "fresh-milk-1l-seller-1",
    description: "Chilled fresh milk for breakfast, tea, and cooking.",
    priceCents: 48000,
    currency: "LKR",
    imageUrl:
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=900&q=80",
    inventoryCount: 26,
    isActive: true,
    sortOrder: 7,
    createdAt: "2026-03-03T13:00:00.000Z"
  },
  {
    id: "listing-8",
    sellerId: "seller-1",
    sellerName: "Sahanz Mart",
    categoryId: "cat-beverages",
    title: "Orange Juice 1L",
    slug: "orange-juice-1l-seller-1",
    description: "Refreshing fruit juice with no added artificial colors.",
    priceCents: 76000,
    currency: "LKR",
    imageUrl:
      "https://images.unsplash.com/photo-1600271886742-f049cd5bba3f?auto=format&fit=crop&w=900&q=80",
    inventoryCount: 19,
    isActive: true,
    sortOrder: 8,
    createdAt: "2026-03-03T14:00:00.000Z"
  },
  {
    id: "listing-9",
    sellerId: "seller-1",
    sellerName: "Sahanz Mart",
    categoryId: "cat-beverages",
    title: "Mineral Water 1.5L",
    slug: "mineral-water-1-5l-seller-1",
    description: "Bottled mineral water for daily hydration and travel.",
    priceCents: 22000,
    currency: "LKR",
    imageUrl:
      "https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&w=900&q=80",
    inventoryCount: 60,
    isActive: true,
    sortOrder: 9,
    createdAt: "2026-03-03T15:00:00.000Z"
  },
  {
    id: "listing-10",
    sellerId: "seller-1",
    sellerName: "Sahanz Mart",
    categoryId: "cat-household",
    title: "Laundry Detergent 2kg",
    slug: "laundry-detergent-2kg-seller-1",
    description: "Front-load and hand-wash detergent with a mild floral scent.",
    priceCents: 164000,
    currency: "LKR",
    imageUrl:
      "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=900&q=80",
    inventoryCount: 15,
    isActive: true,
    sortOrder: 10,
    createdAt: "2026-03-03T16:00:00.000Z"
  },
  {
    id: "listing-11",
    sellerId: "seller-1",
    sellerName: "Sahanz Mart",
    categoryId: "cat-household",
    title: "Multipurpose Cleaner 500ml",
    slug: "multipurpose-cleaner-500ml-seller-1",
    description: "Spray cleaner for kitchen counters, tables, and common surfaces.",
    priceCents: 89000,
    currency: "LKR",
    imageUrl:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80",
    inventoryCount: 28,
    isActive: true,
    sortOrder: 11,
    createdAt: "2026-03-03T17:00:00.000Z"
  },
  {
    id: "listing-12",
    sellerId: "seller-1",
    sellerName: "Sahanz Mart",
    categoryId: "cat-household",
    title: "Tissue Roll Pack",
    slug: "tissue-roll-pack-seller-1",
    description: "Soft household tissue roll pack for bathrooms and kitchens.",
    priceCents: 99000,
    currency: "LKR",
    imageUrl:
      "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=900&q=80",
    inventoryCount: 33,
    isActive: true,
    sortOrder: 12,
    createdAt: "2026-03-03T18:00:00.000Z"
  }
];

sellerProducts.forEach((product) => {
  Object.assign(product, buildProductContent(product));
});

const orders = [
  {
    id: "order-1",
    customerId: "customer-1",
    customerName: "Nethmi Perera",
    sellerId: "seller-1",
    sellerName: "Sahanz Mart",
    status: "processing",
    deliveryStatus: "assigned",
    totalCents: 337000,
    currency: "LKR",
    recipientName: "Nethmi Perera",
    deliveryAddress: "12 Lake Road, Colombo 08",
    deliveryAddressLine1: "12 Lake Road",
    deliveryAddressLine2: "",
    deliveryCity: "Colombo 08",
    deliveryPostalCode: "00800",
    deliveryCoordinates: {
      latitude: 6.9147,
      longitude: 79.877
    },
    notes: "Call on arrival.",
    cancelledByRole: "",
    cancellationReason: "",
    cancellationNote: "",
    cancelledAt: null,
    createdAt: "2026-03-04T09:30:00.000Z",
    items: [
      {
        productId: "listing-1",
        title: "Nadu Rice 5kg",
        quantity: 1,
        priceCents: 245000,
        imageUrl: sellerProducts[0].imageUrl
      },
      {
        productId: "listing-2",
        title: "Ceylon Tea 400g",
        quantity: 1,
        priceCents: 92000,
        imageUrl: sellerProducts[1].imageUrl
      }
    ]
  }
];

const deliveryTasks = [
  {
    id: "delivery-1-task-1",
    orderId: "order-1",
    riderId: "delivery-1",
    riderName: "Rashmika Rider",
    status: "assigned",
    createdAt: "2026-03-04T09:45:00.000Z"
  }
];

let sequence = 100;

function nextId(prefix) {
  sequence += 1;
  return `${prefix}-${sequence}`;
}

function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  const { passwordHash, ...profile } = user;
  return { ...profile };
}

function listUsers() {
  return users.map(sanitizeUser);
}

function sanitizeProfileUpdate(input, role) {
  const nextProfile = {};

  if (typeof input.name === "string") {
    nextProfile.name = input.name.trim();
  }

  if (typeof input.username === "string") {
    nextProfile.username = input.username.trim().toLowerCase();
  }

  if (typeof input.email === "string") {
    nextProfile.email = input.email.trim().toLowerCase();
  }

  if (typeof input.phone === "string") {
    nextProfile.phone = input.phone.trim();
  }

  if (typeof input.profileNote === "string") {
    nextProfile.profileNote = input.profileNote.trim();
  }

  if (typeof input.avatarUrl === "string") {
    nextProfile.avatarUrl = input.avatarUrl.trim();
  }

  if (role === "customer" && typeof input.address === "string") {
    nextProfile.address = input.address.trim();
  }

  if (role === "seller") {
    if (typeof input.businessName === "string") {
      nextProfile.businessName = input.businessName.trim();
    }

    if (typeof input.businessAddress === "string") {
      nextProfile.businessAddress = input.businessAddress.trim();
    }

    if (typeof input.serviceArea === "string") {
      nextProfile.serviceArea = input.serviceArea.trim();
    }
  }

  if (role === "delivery") {
    if (typeof input.vehicleType === "string") {
      nextProfile.vehicleType = input.vehicleType.trim();
    }

    if (typeof input.serviceArea === "string") {
      nextProfile.serviceArea = input.serviceArea.trim();
    }
  }

  if (Array.isArray(input.savedAddresses)) {
    nextProfile.savedAddresses = input.savedAddresses.map((entry, index) => ({
      id: entry.id || `addr-${index + 1}`,
      label: String(entry.label || `Address ${index + 1}`).trim(),
      recipientName: String(entry.recipientName || "").trim(),
      addressLine1: String(entry.addressLine1 || entry.address || "").trim(),
      addressLine2: String(entry.addressLine2 || "").trim(),
      city: String(entry.city || "").trim(),
      postalCode: String(entry.postalCode || "").trim(),
      address:
        composeAddress({
          addressLine1: entry.addressLine1 || entry.address || "",
          addressLine2: entry.addressLine2 || "",
          city: entry.city || "",
          postalCode: entry.postalCode || ""
        }) || String(entry.address || "").trim(),
      latitude: Number(entry.latitude),
      longitude: Number(entry.longitude),
      isDefault: Boolean(entry.isDefault)
    }));
  }

  return nextProfile;
}

function normalizeCoordinate(value) {
  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return null;
  }

  return parsed;
}

function normalizeDeliveryCoordinates(input) {
  if (!input) {
    return null;
  }

  const latitude = normalizeCoordinate(input.latitude);
  const longitude = normalizeCoordinate(input.longitude);

  if (latitude === null || longitude === null) {
    return null;
  }

  if (latitude < -90 || latitude > 90) {
    throw new Error("Latitude must be between -90 and 90");
  }

  if (longitude < -180 || longitude > 180) {
    throw new Error("Longitude must be between -180 and 180");
  }

  return { latitude, longitude };
}

function roundCoordinate(value, digits) {
  return Number(value.toFixed(digits));
}

function buildApproximateCoordinates(coordinates) {
  if (!coordinates) {
    return null;
  }

  return {
    latitude: roundCoordinate(coordinates.latitude, 2),
    longitude: roundCoordinate(coordinates.longitude, 2)
  };
}

function buildGoogleMapsLink(coordinates, mode = "place") {
  if (!coordinates) {
    return null;
  }

  const destination = `${coordinates.latitude},${coordinates.longitude}`;

  if (mode === "directions") {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;
}

function formatLocationForRole(order, role) {
  const exactCoordinates = order.deliveryCoordinates
    ? { ...order.deliveryCoordinates }
    : null;
  const approximateCoordinates = buildApproximateCoordinates(order.deliveryCoordinates);

  return {
    address: order.deliveryAddress,
    addressLine1: order.deliveryAddressLine1 || "",
    addressLine2: order.deliveryAddressLine2 || "",
    city: order.deliveryCity || "",
    postalCode: order.deliveryPostalCode || "",
    exactCoordinates: role === "delivery" || role === "customer" ? exactCoordinates : null,
    approximateCoordinates,
    sellerMapLink:
      role === "seller" && approximateCoordinates
        ? buildGoogleMapsLink(approximateCoordinates)
        : null,
    deliveryMapLink:
      role === "delivery" && exactCoordinates
        ? buildGoogleMapsLink(exactCoordinates)
        : null,
    deliveryNavigationLink:
      role === "delivery" && exactCoordinates
        ? buildGoogleMapsLink(exactCoordinates, "directions")
        : null
  };
}

function formatOrderForRole(order, role) {
  const location = formatLocationForRole(order, role);
  const task = deliveryTasks.find((entry) => entry.orderId === order.id) || null;

  return {
    ...order,
    riderName: task?.riderName || order.riderName || "",
    cancelledByRole: order.cancelledByRole || "",
    cancellationReason: order.cancellationReason || "",
    cancellationNote: order.cancellationNote || "",
    cancelledAt: order.cancelledAt || null,
    deliveryTaskId: task?.id || "",
    deliveryTaskStatus: task?.status || order.deliveryStatus || "",
    deliveryLocation: location,
    deliveryAddressLine1: order.deliveryAddressLine1 || "",
    deliveryAddressLine2: order.deliveryAddressLine2 || "",
    deliveryCity: order.deliveryCity || "",
    deliveryPostalCode: order.deliveryPostalCode || "",
    deliveryCoordinates: location.exactCoordinates,
    items: order.items.map((item) => ({ ...item }))
  };
}

function assertOrderCancellable(order) {
  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status === "cancelled") {
    throw new Error("This order has already been cancelled");
  }

  if (
    order.status === "delivered" ||
    order.status === "out_for_delivery" ||
    order.deliveryStatus === "picked_up" ||
    order.deliveryStatus === "in_transit" ||
    order.deliveryStatus === "delivered"
  ) {
    throw new Error("This order can no longer be cancelled");
  }
}

function restoreOrderInventory(order) {
  for (const item of order.items) {
    const product = sellerProducts.find((entry) => entry.id === item.productId);

    if (product) {
      product.inventoryCount += item.quantity;
    }
  }
}

function getUserRecordById(userId) {
  return users.find((user) => user.id === userId) || null;
}

function getUserById(userId) {
  return sanitizeUser(getUserRecordById(userId));
}

function findUserByIdentifier(identifier, role) {
  const normalized = String(identifier || "").trim().toLowerCase();

  return (
    users.find(
      (user) =>
        user.role === role &&
        (user.email.toLowerCase() === normalized || user.username === normalized)
    ) || null
  );
}

function assertUniqueCredentials({ email, username }, excludeUserId = null) {
  const normalizedEmail = email?.trim().toLowerCase();
  const normalizedUsername = username?.trim().toLowerCase();

  const existing = users.find(
    (user) =>
      user.id !== excludeUserId &&
      (user.email === normalizedEmail || user.username === normalizedUsername)
  );

  if (existing) {
    throw new Error("Email or username is already in use");
  }
}

function authenticateUser({ identifier, password, role }) {
  const user = findUserByIdentifier(identifier, role);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new Error("Invalid credentials");
  }

  return sanitizeUser(user);
}

function createUser(input) {
  const role = input.role;
  const email = String(input.email || "").trim().toLowerCase();
  const username = String(input.username || "").trim().toLowerCase();
  const password = String(input.password || "");
  const name = String(input.name || "").trim();

  if (!["customer", "seller", "delivery"].includes(role)) {
    throw new Error("Unsupported role");
  }

  if (!email || !username || !password || !name) {
    throw new Error("Name, username, email, and password are required");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  assertUniqueCredentials({ email, username });

  const nextUser = {
    id: nextId(role),
    username,
    name,
    email,
    passwordHash: hashPassword(password),
    role,
    phone: String(input.phone || "").trim(),
    address: role === "customer" ? String(input.address || "").trim() : "",
    businessName: role === "seller" ? String(input.businessName || "").trim() : "",
    businessAddress:
      role === "seller" ? String(input.businessAddress || "").trim() : "",
    serviceArea: String(input.serviceArea || "").trim(),
    vehicleType: role === "delivery" ? String(input.vehicleType || "").trim() : "",
    profileNote: "",
    avatarUrl: "",
    savedAddresses: []
  };

  if (role === "seller" && (!nextUser.businessName || !nextUser.businessAddress)) {
    throw new Error("Store name and store location are required");
  }

  if (role === "delivery" && !nextUser.phone) {
    throw new Error("Phone number is required");
  }

  users.push(nextUser);
  return sanitizeUser(nextUser);
}

function updateUserProfile(userId, input) {
  const user = users.find((entry) => entry.id === userId);

  if (!user) {
    throw new Error("User not found");
  }

  const nextProfile = sanitizeProfileUpdate(input, user.role);

  if ("email" in nextProfile || "username" in nextProfile) {
    assertUniqueCredentials(
      {
        email: nextProfile.email || user.email,
        username: nextProfile.username || user.username
      },
      userId
    );
  }

  if ("name" in nextProfile && !nextProfile.name) {
    throw new Error("Full name is required");
  }

  if ("username" in nextProfile && !nextProfile.username) {
    throw new Error("Username is required");
  }

  if ("email" in nextProfile && !nextProfile.email) {
    throw new Error("Email is required");
  }

  Object.assign(user, nextProfile);

  if (user.role === "seller" && nextProfile.businessName) {
    sellerProducts.forEach((product) => {
      if (product.sellerId === user.id) {
        product.sellerName = user.businessName || user.name;
      }
    });

    orders.forEach((order) => {
      if (order.sellerId === user.id) {
        order.sellerName = user.businessName || user.name;
      }
    });
  }

  if (user.role !== "seller" && nextProfile.name) {
    if (user.role === "customer") {
      orders.forEach((order) => {
        if (order.customerId === user.id) {
          order.customerName = user.name;
          order.recipientName = user.name;
        }
      });
    }

    if (user.role === "delivery") {
      deliveryTasks.forEach((task) => {
        if (task.riderId === user.id) {
          task.riderName = user.name;
        }
      });
    }
  }

  return sanitizeUser(user);
}

function listCategories() {
  return categories
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((category) => ({ ...category }));
}

function listActiveSellerProducts() {
  return sellerProducts
    .filter((product) => product.isActive)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((product) => ({ ...product }));
}

function listSellerProductsBySeller(sellerId) {
  return sellerProducts
    .filter((product) => product.sellerId === sellerId)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((product) => ({ ...product }));
}

function createSellerProduct(input) {
  const seller = getUserRecordById(input.sellerId);
  const category = categories.find((entry) => entry.id === input.categoryId);
  let slug = input.slug;

  if (!seller || seller.role !== "seller") {
    throw new Error("Seller account not found");
  }

  if (!category) {
    throw new Error("Category not found");
  }

  while (sellerProducts.some((product) => product.slug === slug)) {
    slug = `${input.slug}-${sequence + 1}`;
  }

  const product = {
    id: nextId("listing"),
    sellerId: input.sellerId,
    sellerName: seller.businessName || seller.name,
    categoryId: input.categoryId,
    title: input.title,
    slug,
    description: input.description,
    priceCents: input.priceCents,
    currency: input.currency || "LKR",
    imageUrl: input.imageUrl || "",
    inventoryCount: input.inventoryCount,
    isActive: true,
    sortOrder: sellerProducts.length + 1,
    createdAt: new Date().toISOString()
  };

  Object.assign(product, {
    galleryImages: Array.isArray(input.galleryImages) ? input.galleryImages : [],
    longDescription: input.longDescription || "",
    details: Array.isArray(input.details) ? input.details : [],
    ingredients: Array.isArray(input.ingredients) ? input.ingredients : [],
    usageNotes: input.usageNotes || "",
    storageNotes: input.storageNotes || ""
  });

  sellerProducts.unshift(product);
  return { ...product };
}

function createOrder(input) {
  const customer = getUserRecordById(input.customerId);
  let sellerId = null;

  if (!customer || customer.role !== "customer") {
    throw new Error("Customer account not found");
  }

  if (!input.items.length) {
    throw new Error("Cart is empty");
  }

  const items = input.items.map((item) => {
    const product = sellerProducts.find((entry) => entry.id === item.productId && entry.isActive);

    if (!product) {
      throw new Error(`Product not found: ${item.productId}`);
    }

    if (item.quantity < 1) {
      throw new Error("Quantity must be at least 1");
    }

    if (product.inventoryCount < item.quantity) {
      throw new Error(`Not enough stock for ${product.title}`);
    }

    if (sellerId && sellerId !== product.sellerId) {
      throw new Error("Orders can only contain products from one seller");
    }

    sellerId = product.sellerId;
    product.inventoryCount -= item.quantity;

    return {
      productId: product.id,
      title: product.title,
      quantity: item.quantity,
      priceCents: product.priceCents,
      imageUrl: product.imageUrl
    };
  });

  const totalCents = items.reduce(
    (sum, item) => sum + item.priceCents * item.quantity,
    0
  );
  const seller = getUserRecordById(sellerId);
  const deliveryCoordinates = normalizeDeliveryCoordinates(input.deliveryCoordinates);
  const order = {
    id: nextId("order"),
    customerId: customer.id,
    customerName: customer.name,
    sellerId,
    sellerName: seller ? seller.businessName || seller.name : "Seller",
    status: "pending",
    deliveryStatus: "awaiting_assignment",
    totalCents,
    currency: "LKR",
    recipientName: input.recipientName || customer.name,
    deliveryAddress: composeAddress({
      addressLine1: input.deliveryAddressLine1,
      addressLine2: input.deliveryAddressLine2,
      city: input.deliveryCity,
      postalCode: input.deliveryPostalCode
    }) || input.deliveryAddress,
    deliveryAddressLine1: String(input.deliveryAddressLine1 || "").trim(),
    deliveryAddressLine2: String(input.deliveryAddressLine2 || "").trim(),
    deliveryCity: String(input.deliveryCity || "").trim(),
    deliveryPostalCode: String(input.deliveryPostalCode || "").trim(),
    deliveryCoordinates,
    notes: input.notes || "",
    cancelledByRole: "",
    cancellationReason: "",
    cancellationNote: "",
    cancelledAt: null,
    createdAt: new Date().toISOString(),
    items
  };

  orders.unshift(order);

  const rider = users.find((entry) => entry.role === "delivery");

  if (rider) {
    deliveryTasks.unshift({
      id: nextId("delivery"),
      orderId: order.id,
      riderId: rider.id,
      riderName: rider.name,
      status: "assigned",
      createdAt: new Date().toISOString()
    });
  }

  return formatOrderForRole(order, customer.role);
}

function updateSellerOrderProgress(orderId, step, sellerId) {
  const order = orders.find(
    (entry) => entry.id === orderId && entry.sellerId === sellerId
  );

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status === "delivered") {
    throw new Error("Delivered orders cannot be updated by the seller");
  }

  if (order.status === "cancelled") {
    throw new Error("Cancelled orders cannot be updated by the seller");
  }

  if (step === "confirm") {
    if (order.status !== "pending") {
      throw new Error("Only pending orders can be confirmed");
    }

    order.status = "processing";
    return formatOrderForRole(order, "seller");
  }

  if (step === "ready_for_pickup") {
    if (order.status === "pending") {
      order.status = "processing";
    }

    if (order.deliveryStatus === "picked_up" || order.deliveryStatus === "in_transit") {
      throw new Error("This order is already with the rider");
    }

    if (order.deliveryStatus === "delivered") {
      throw new Error("This order has already been delivered");
    }

    order.deliveryStatus = "assigned";
    return formatOrderForRole(order, "seller");
  }

  throw new Error("Unsupported seller progress step");
}

function cancelOrder(orderId, actor, reason, note = "") {
  if (!["customer", "seller"].includes(actor.role)) {
    throw new Error("Only customers or sellers can cancel orders");
  }

  const order = orders.find((entry) => {
    if (entry.id !== orderId) {
      return false;
    }

    if (actor.role === "customer") {
      return entry.customerId === actor.id;
    }

    return entry.sellerId === actor.id;
  });

  assertOrderCancellable(order);

  if (!String(reason || "").trim()) {
    throw new Error("Please select a cancellation reason");
  }

  restoreOrderInventory(order);

  order.status = "cancelled";
  order.deliveryStatus = "cancelled";
  order.cancelledByRole = actor.role;
  order.cancellationReason = String(reason).trim();
  order.cancellationNote = String(note || "").trim();
  order.cancelledAt = new Date().toISOString();

  for (let index = deliveryTasks.length - 1; index >= 0; index -= 1) {
    if (deliveryTasks[index].orderId === order.id) {
      deliveryTasks.splice(index, 1);
    }
  }

  return formatOrderForRole(order, actor.role);
}

function listOrdersForUser(user) {
  let filtered = orders;

  if (user.role === "customer") {
    filtered = orders.filter((order) => order.customerId === user.id);
  }

  if (user.role === "seller") {
    filtered = orders.filter((order) => order.sellerId === user.id);
  }

  if (user.role === "delivery") {
    const orderIds = new Set(
      deliveryTasks
        .filter((task) => task.riderId === user.id)
        .map((task) => task.orderId)
    );
    filtered = orders.filter((order) => orderIds.has(order.id));
  }

  return filtered.map((order) => formatOrderForRole(order, user.role));
}

function listDeliveryTasksForUser(userId) {
  return deliveryTasks
    .filter((task) => task.riderId === userId)
    .map((task) => {
      const order = orders.find((entry) => entry.id === task.orderId);

      return {
        ...task,
        order: order
          ? formatOrderForRole(order, "delivery")
          : null
      };
    });
}

function updateDeliveryTaskStatus(taskId, status, riderId) {
  const task = deliveryTasks.find(
    (entry) => entry.id === taskId && entry.riderId === riderId
  );

  if (!task) {
    throw new Error("Delivery task not found");
  }

  task.status = status;

  const order = orders.find((entry) => entry.id === task.orderId);

  if (order) {
    if (status === "picked_up" && order.deliveryStatus !== "assigned") {
      throw new Error("Seller has not marked this order ready for pickup yet");
    }

    if (order.status === "cancelled") {
      throw new Error("Cancelled orders cannot be updated");
    }

    if (status === "in_transit" && order.deliveryStatus !== "picked_up") {
      throw new Error("Mark the order as picked up before starting delivery");
    }

    if (status === "delivered" && order.deliveryStatus !== "in_transit") {
      throw new Error("Mark the order as in transit before completing delivery");
    }

    order.deliveryStatus = status;

    if (status === "picked_up") {
      order.status = "out_for_delivery";
    }

    if (status === "delivered") {
      order.status = "delivered";
    }
  }

  return {
    ...task,
    order: order
      ? formatOrderForRole(order, "delivery")
      : null
  };
}

function deleteListingsForSeller(sellerId) {
  for (let index = sellerProducts.length - 1; index >= 0; index -= 1) {
    if (sellerProducts[index].sellerId === sellerId) {
      sellerProducts.splice(index, 1);
    }
  }
}

function deleteStoreByOwner(sellerId) {
  deleteListingsForSeller(sellerId);

  for (let index = orders.length - 1; index >= 0; index -= 1) {
    if (orders[index].sellerId === sellerId) {
      const orderId = orders[index].id;
      orders.splice(index, 1);

      for (let taskIndex = deliveryTasks.length - 1; taskIndex >= 0; taskIndex -= 1) {
        if (deliveryTasks[taskIndex].orderId === orderId) {
          deliveryTasks.splice(taskIndex, 1);
        }
      }
    }
  }

  return deleteUserAccount(sellerId);
}

function deleteUserAccount(userId) {
  const userIndex = users.findIndex((user) => user.id === userId);

  if (userIndex === -1) {
    throw new Error("User not found");
  }

  const [removedUser] = users.splice(userIndex, 1);

  if (removedUser.role === "customer") {
    for (let index = orders.length - 1; index >= 0; index -= 1) {
      if (orders[index].customerId === userId) {
        const orderId = orders[index].id;
        orders.splice(index, 1);

        for (let taskIndex = deliveryTasks.length - 1; taskIndex >= 0; taskIndex -= 1) {
          if (deliveryTasks[taskIndex].orderId === orderId) {
            deliveryTasks.splice(taskIndex, 1);
          }
        }
      }
    }
  }

  if (removedUser.role === "delivery") {
    for (let index = deliveryTasks.length - 1; index >= 0; index -= 1) {
      if (deliveryTasks[index].riderId === userId) {
        deliveryTasks.splice(index, 1);
      }
    }
  }

  return sanitizeUser(removedUser);
}

module.exports = {
  authenticateUser,
  createOrder,
  cancelOrder,
  createSellerProduct,
  createUser,
  deleteListingsForSeller,
  deleteStoreByOwner,
  deleteUserAccount,
  getUserById,
  listActiveSellerProducts,
  listCategories,
  listDeliveryTasksForUser,
  listOrdersForUser,
  listSellerProductsBySeller,
  listUsers,
  updateSellerOrderProgress,
  updateUserProfile,
  updateDeliveryTaskStatus
};
