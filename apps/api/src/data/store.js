const categories = [
  { id: "cat-groceries", name: "Groceries", slug: "groceries", sortOrder: 1 },
  { id: "cat-beverages", name: "Beverages", slug: "beverages", sortOrder: 2 },
  { id: "cat-household", name: "Household", slug: "household", sortOrder: 3 }
];

const users = [
  {
    id: "customer-1",
    name: "Nethmi Perera",
    email: "customer@sahanz.store",
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
        latitude: 6.9147,
        longitude: 79.877,
        isDefault: true
      },
      {
        id: "addr-office",
        label: "Office",
        recipientName: "Nethmi Perera",
        address: "75 Union Place, Colombo 02",
        latitude: 6.9172,
        longitude: 79.8611,
        isDefault: false
      }
    ]
  },
  {
    id: "seller-1",
    name: "Sahanz Mart",
    email: "seller@sahanz.store",
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
    name: "Rashmika Rider",
    email: "delivery@sahanz.store",
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
    sortOrder: 1
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
    sortOrder: 2
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
    sortOrder: 3
  }
];

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
    deliveryCoordinates: {
      latitude: 6.9147,
      longitude: 79.877
    },
    notes: "Call on arrival.",
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

function listUsers() {
  return users.map((user) => ({ ...user }));
}

function sanitizeProfileUpdate(input, role) {
  const nextProfile = {};

  if (typeof input.name === "string") {
    nextProfile.name = input.name.trim();
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
      address: String(entry.address || "").trim(),
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

  return {
    ...order,
    deliveryLocation: location,
    deliveryCoordinates: location.exactCoordinates,
    items: order.items.map((item) => ({ ...item }))
  };
}

function getUserById(userId) {
  return users.find((user) => user.id === userId) || null;
}

function updateUserProfile(userId, input) {
  const user = users.find((entry) => entry.id === userId);

  if (!user) {
    throw new Error("User not found");
  }

  const nextProfile = sanitizeProfileUpdate(input, user.role);

  if ("email" in nextProfile) {
    const existing = users.find(
      (entry) => entry.id !== userId && entry.email === nextProfile.email
    );

    if (existing) {
      throw new Error("Email is already in use");
    }
  }

  if ("name" in nextProfile && !nextProfile.name) {
    throw new Error("Full name is required");
  }

  if ("email" in nextProfile && !nextProfile.email) {
    throw new Error("Email is required");
  }

  Object.assign(user, nextProfile);

  if (user.role === "seller" && nextProfile.businessName) {
    user.name = nextProfile.businessName;

    sellerProducts.forEach((product) => {
      if (product.sellerId === user.id) {
        product.sellerName = user.name;
      }
    });

    orders.forEach((order) => {
      if (order.sellerId === user.id) {
        order.sellerName = user.name;
      }
    });
  }

  if (user.role !== "seller" && nextProfile.name) {
    if (user.role === "customer") {
      orders.forEach((order) => {
        if (order.customerId === user.id) {
          order.customerName = user.name;
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

  return { ...user };
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
  const seller = getUserById(input.sellerId);
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
    sellerName: seller.name,
    categoryId: input.categoryId,
    title: input.title,
    slug,
    description: input.description,
    priceCents: input.priceCents,
    currency: input.currency || "LKR",
    imageUrl: input.imageUrl || "",
    inventoryCount: input.inventoryCount,
    isActive: true,
    sortOrder: sellerProducts.length + 1
  };

  sellerProducts.unshift(product);
  return { ...product };
}

function createOrder(input) {
  const customer = getUserById(input.customerId);
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
  const seller = getUserById(sellerId);
  const deliveryCoordinates = normalizeDeliveryCoordinates(input.deliveryCoordinates);
  const order = {
    id: nextId("order"),
    customerId: customer.id,
    customerName: customer.name,
    sellerId,
    sellerName: seller ? seller.name : "Seller",
    status: "pending",
    deliveryStatus: "awaiting_assignment",
    totalCents,
    currency: "LKR",
    recipientName: input.recipientName || customer.name,
    deliveryAddress: input.deliveryAddress,
    deliveryCoordinates,
    notes: input.notes || "",
    createdAt: new Date().toISOString(),
    items
  };

  orders.unshift(order);

  const task = {
    id: nextId("delivery"),
    orderId: order.id,
    riderId: "delivery-1",
    riderName: "Rashmika Rider",
    status: "assigned",
    createdAt: new Date().toISOString()
  };

  deliveryTasks.unshift(task);

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

module.exports = {
  createOrder,
  createSellerProduct,
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
