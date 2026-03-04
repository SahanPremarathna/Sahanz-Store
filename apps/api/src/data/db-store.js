const { isSupabaseConfigured, supabaseAdmin } = require("../lib/supabase");
const { hashPassword, verifyPassword } = require("../lib/auth");

function ensureSupabase() {
  if (!isSupabaseConfigured() || !supabaseAdmin) {
    throw new Error("Supabase is not configured");
  }

  return supabaseAdmin;
}

function requireSingle(result, context) {
  if (result.error) {
    throw new Error(`${context}: ${result.error.message}`);
  }

  return result.data;
}

function buildSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function roundCoordinate(value, digits) {
  return Number(value.toFixed(digits));
}

function mapProfile(profile) {
  return {
    id: profile.id,
    username: profile.username,
    name: profile.full_name,
    email: profile.email,
    role: profile.role,
    phone: profile.phone,
    address: profile.address || "",
    businessName: profile.business_name || "",
    businessAddress: profile.business_address || "",
    serviceArea: profile.service_area || "",
    vehicleType: profile.vehicle_type || "",
    profileNote: profile.profile_note || "",
    avatarUrl: profile.avatar_url || "",
    savedAddresses: Array.isArray(profile.saved_addresses)
      ? profile.saved_addresses.map((entry, index) => ({
          id: entry.id || `addr-${index + 1}`,
          label: entry.label || `Address ${index + 1}`,
          recipientName: entry.recipient_name || "",
          address: entry.address || "",
          addressLine1: entry.address_line_1 || entry.address || "",
          addressLine2: entry.address_line_2 || "",
          city: entry.city || "",
          postalCode: entry.postal_code || "",
          latitude: Number(entry.latitude || 0),
          longitude: Number(entry.longitude || 0),
          isDefault: Boolean(entry.is_default)
        }))
      : []
  };
}

function sanitizeProfileUpdate(input, role) {
  const nextProfile = {};

  if (typeof input.name === "string") {
    nextProfile.full_name = input.name.trim();
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
    nextProfile.profile_note = input.profileNote.trim();
  }

  if (typeof input.avatarUrl === "string") {
    nextProfile.avatar_url = input.avatarUrl.trim();
  }

  if (role === "customer" && typeof input.address === "string") {
    nextProfile.address = input.address.trim();
  }

  if (role === "seller") {
    if (typeof input.businessName === "string") {
      nextProfile.business_name = input.businessName.trim();
    }

    if (typeof input.businessAddress === "string") {
      nextProfile.business_address = input.businessAddress.trim();
    }

    if (typeof input.serviceArea === "string") {
      nextProfile.service_area = input.serviceArea.trim();
    }
  }

  if (role === "delivery") {
    if (typeof input.vehicleType === "string") {
      nextProfile.vehicle_type = input.vehicleType.trim();
    }

    if (typeof input.serviceArea === "string") {
      nextProfile.service_area = input.serviceArea.trim();
    }
  }

  if (Array.isArray(input.savedAddresses)) {
    nextProfile.saved_addresses = input.savedAddresses.map((entry, index) => ({
      id: entry.id || `addr-${index + 1}`,
      label: String(entry.label || `Address ${index + 1}`).trim(),
      recipient_name: String(entry.recipientName || "").trim(),
      address: String(entry.address || "").trim(),
      address_line_1: String(entry.addressLine1 || entry.address || "").trim(),
      address_line_2: String(entry.addressLine2 || "").trim(),
      city: String(entry.city || "").trim(),
      postal_code: String(entry.postalCode || "").trim(),
      latitude: Number(entry.latitude),
      longitude: Number(entry.longitude),
      is_default: Boolean(entry.isDefault)
    }));
  }

  return nextProfile;
}

function mapProduct(product, sellerName) {
  return {
    id: product.id,
    sellerId: product.seller_id,
    sellerName,
    categoryId: product.category_id,
    title: product.title,
    slug: product.slug,
    description: product.description,
    longDescription: product.long_description || "",
    details: Array.isArray(product.details) ? product.details : [],
    ingredients: Array.isArray(product.ingredients) ? product.ingredients : [],
    usageNotes: product.usage_notes || "",
    storageNotes: product.storage_notes || "",
    galleryImages: Array.isArray(product.gallery_images) ? product.gallery_images : [],
    priceCents: product.price_cents,
    currency: product.currency,
    imageUrl: product.image_url,
    inventoryCount: product.inventory_count,
    isActive: product.is_active,
    sortOrder: product.sort_order,
    createdAt: product.created_at
  };
}

function formatLocationForRole(order, role) {
  const exactCoordinates =
    order.delivery_latitude !== null && order.delivery_longitude !== null
      ? {
          latitude: order.delivery_latitude,
          longitude: order.delivery_longitude
        }
      : null;
  const approximateCoordinates = exactCoordinates
    ? {
        latitude: roundCoordinate(exactCoordinates.latitude, 2),
        longitude: roundCoordinate(exactCoordinates.longitude, 2)
      }
    : null;

  return {
    address: order.delivery_address,
    addressLine1: order.delivery_address_line_1 || "",
    addressLine2: order.delivery_address_line_2 || "",
    city: order.delivery_city || "",
    postalCode: order.delivery_postal_code || "",
    exactCoordinates: role === "customer" || role === "delivery" ? exactCoordinates : null,
    approximateCoordinates,
    sellerMapLink:
      role === "seller" && approximateCoordinates
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `${approximateCoordinates.latitude},${approximateCoordinates.longitude}`
          )}`
        : null,
    deliveryMapLink:
      role === "delivery" && exactCoordinates
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `${exactCoordinates.latitude},${exactCoordinates.longitude}`
          )}`
        : null,
    deliveryNavigationLink:
      role === "delivery" && exactCoordinates
        ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
            `${exactCoordinates.latitude},${exactCoordinates.longitude}`
          )}`
        : null
  };
}

async function getProfilesByIds(ids) {
  if (!ids.length) {
    return new Map();
  }

  const supabase = ensureSupabase();
  const result = await supabase
    .from("profiles")
    .select("id, username, full_name, email, role, phone, address, business_name, business_address, service_area, vehicle_type, profile_note, avatar_url, saved_addresses")
    .in("id", ids);
  const rows = requireSingle(result, "Failed to load profiles");

  return new Map(rows.map((row) => [row.id, row]));
}

async function getOrderItemsByOrderIds(orderIds) {
  if (!orderIds.length) {
    return new Map();
  }

  const supabase = ensureSupabase();
  const result = await supabase
    .from("order_items")
    .select("id, order_id, seller_product_id, title_snapshot, image_url_snapshot, quantity, price_cents")
    .in("order_id", orderIds)
    .order("created_at", { ascending: true });
  const rows = requireSingle(result, "Failed to load order items");

  const grouped = new Map();

  for (const row of rows) {
    const items = grouped.get(row.order_id) || [];
    items.push({
      productId: row.seller_product_id,
      title: row.title_snapshot,
      quantity: row.quantity,
      priceCents: row.price_cents,
      imageUrl: row.image_url_snapshot
    });
    grouped.set(row.order_id, items);
  }

  return grouped;
}

async function getDeliveryTasksByOrderIds(orderIds) {
  if (!orderIds.length) {
    return new Map();
  }

  const supabase = ensureSupabase();
  const result = await supabase
    .from("delivery_tasks")
    .select("id, order_id, rider_id, status, created_at, updated_at")
    .in("order_id", orderIds);
  const rows = requireSingle(result, "Failed to load delivery tasks");

  return new Map(rows.map((row) => [row.order_id, row]));
}

async function enrichOrders(rows, role) {
  const customerIds = [...new Set(rows.map((row) => row.customer_id))];
  const sellerIds = [...new Set(rows.map((row) => row.seller_id))];
  const riderIds = [...new Set(rows.map((row) => row.delivery_rider_id).filter(Boolean))];
  const profiles = await getProfilesByIds([...new Set([...customerIds, ...sellerIds, ...riderIds])]);
  const itemsByOrderId = await getOrderItemsByOrderIds(rows.map((row) => row.id));
  const deliveryTasksByOrderId = await getDeliveryTasksByOrderIds(rows.map((row) => row.id));

  return rows.map((row) => {
    const customer = profiles.get(row.customer_id);
    const seller = profiles.get(row.seller_id);
    const rider = row.delivery_rider_id ? profiles.get(row.delivery_rider_id) : null;
    const deliveryLocation = formatLocationForRole(row, role);
    const deliveryTask = deliveryTasksByOrderId.get(row.id) || null;

    return {
      id: row.id,
      customerId: row.customer_id,
      customerName: customer?.full_name || "Customer",
      sellerId: row.seller_id,
      sellerName: seller?.business_name || seller?.full_name || "Seller",
      deliveryRiderId: row.delivery_rider_id,
      riderName: rider?.full_name || "",
      status: row.status,
      deliveryStatus: row.delivery_status,
      cancelledByRole: row.cancelled_by_role || "",
      cancellationReason: row.cancellation_reason || "",
      cancellationNote: row.cancellation_note || "",
      cancelledAt: row.cancelled_at || null,
      deliveryTaskId: deliveryTask?.id || "",
      deliveryTaskStatus: deliveryTask?.status || row.delivery_status,
      totalCents: row.total_cents,
      currency: row.currency,
      recipientName: row.recipient_name,
      deliveryAddress: row.delivery_address,
      deliveryAddressLine1: row.delivery_address_line_1 || "",
      deliveryAddressLine2: row.delivery_address_line_2 || "",
      deliveryCity: row.delivery_city || "",
      deliveryPostalCode: row.delivery_postal_code || "",
      deliveryCoordinates: deliveryLocation.exactCoordinates,
      deliveryLocation,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      items: itemsByOrderId.get(row.id) || []
    };
  });
}

function assertOrderCancellable(row) {
  if (!row) {
    throw new Error("Order not found");
  }

  if (row.status === "cancelled") {
    throw new Error("This order has already been cancelled");
  }

  if (
    row.status === "delivered" ||
    row.status === "out_for_delivery" ||
    row.delivery_status === "picked_up" ||
    row.delivery_status === "in_transit" ||
    row.delivery_status === "delivered"
  ) {
    throw new Error("This order can no longer be cancelled");
  }
}

async function assertUniqueCredentials({ email, username }, excludeId = null) {
  const supabase = ensureSupabase();
  const result = await supabase
    .from("profiles")
    .select("id, email, username")
    .or(`email.eq.${email},username.eq.${username}`);
  const rows = requireSingle(result, "Failed to verify credentials");

  const conflict = rows.find((row) => row.id !== excludeId);

  if (conflict) {
    throw new Error("Email or username is already in use");
  }
}

async function listUsers() {
  const supabase = ensureSupabase();
  const result = await supabase
    .from("profiles")
    .select("id, username, full_name, email, role, phone, address, business_name, business_address, service_area, vehicle_type, profile_note, avatar_url, saved_addresses")
    .order("created_at", { ascending: true });

  return requireSingle(result, "Failed to load users").map(mapProfile);
}

async function getUserById(userId) {
  const supabase = ensureSupabase();
  const result = await supabase
    .from("profiles")
    .select("id, username, full_name, email, role, phone, address, business_name, business_address, service_area, vehicle_type, profile_note, avatar_url, saved_addresses")
    .eq("id", userId)
    .maybeSingle();
  const row = requireSingle(result, "Failed to load user");

  return row ? mapProfile(row) : null;
}

async function authenticateUser({ identifier, password, role }) {
  const supabase = ensureSupabase();
  const normalized = String(identifier || "").trim().toLowerCase();
  const result = await supabase
    .from("profiles")
    .select("id, username, full_name, email, role, phone, address, business_name, business_address, service_area, vehicle_type, profile_note, avatar_url, saved_addresses, password_hash")
    .eq("role", role)
    .or(`email.eq.${normalized},username.eq.${normalized}`)
    .maybeSingle();
  const row = requireSingle(result, "Failed to authenticate user");

  if (!row || !verifyPassword(password, row.password_hash)) {
    throw new Error("Invalid credentials");
  }

  return mapProfile(row);
}

async function createUser(input) {
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

  if (role === "seller" && (!input.businessName || !input.businessAddress)) {
    throw new Error("Store name and store location are required");
  }

  if (role === "delivery" && !input.phone) {
    throw new Error("Phone number is required");
  }

  await assertUniqueCredentials({ email, username });

  const supabase = ensureSupabase();
  const insert = await supabase
    .from("profiles")
    .insert({
      username,
      email,
      password_hash: hashPassword(password),
      full_name: name,
      role,
      phone: String(input.phone || "").trim(),
      address: role === "customer" ? String(input.address || "").trim() : "",
      business_name: role === "seller" ? String(input.businessName || "").trim() : "",
      business_address: role === "seller" ? String(input.businessAddress || "").trim() : "",
      service_area: String(input.serviceArea || "").trim(),
      vehicle_type: role === "delivery" ? String(input.vehicleType || "").trim() : "",
      profile_note: "",
      avatar_url: "",
      saved_addresses: []
    })
    .select("id, username, full_name, email, role, phone, address, business_name, business_address, service_area, vehicle_type, profile_note, avatar_url, saved_addresses")
    .single();

  return mapProfile(requireSingle(insert, "Failed to create user"));
}

async function listCategories() {
  const supabase = ensureSupabase();
  const result = await supabase
    .from("categories")
    .select("id, name, slug, sort_order")
    .order("sort_order", { ascending: true });

  return requireSingle(result, "Failed to load categories").map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    sortOrder: row.sort_order
  }));
}

async function updateUserProfile(userId, input) {
  const current = await getUserById(userId);

  if (!current) {
    throw new Error("User not found");
  }

  const payload = sanitizeProfileUpdate(input, current.role);

  if ("full_name" in payload && !payload.full_name) {
    throw new Error("Full name is required");
  }

  if ("username" in payload && !payload.username) {
    throw new Error("Username is required");
  }

  if ("email" in payload && !payload.email) {
    throw new Error("Email is required");
  }

  if ("email" in payload || "username" in payload) {
    await assertUniqueCredentials(
      {
        email: payload.email || current.email,
        username: payload.username || current.username
      },
      userId
    );
  }

  const supabase = ensureSupabase();
  const result = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId)
    .select("id, username, full_name, email, role, phone, address, business_name, business_address, service_area, vehicle_type, profile_note, avatar_url, saved_addresses")
    .single();

  return mapProfile(requireSingle(result, "Failed to update profile"));
}

async function listActiveSellerProducts() {
  const supabase = ensureSupabase();
  const result = await supabase
    .from("seller_products")
    .select("id, seller_id, category_id, title, slug, description, long_description, details, ingredients, usage_notes, storage_notes, gallery_images, price_cents, currency, image_url, inventory_count, is_active, sort_order, created_at")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  const rows = requireSingle(result, "Failed to load products");
  const sellers = await getProfilesByIds([...new Set(rows.map((row) => row.seller_id))]);

  return rows.map((row) =>
    mapProduct(
      row,
      sellers.get(row.seller_id)?.business_name ||
        sellers.get(row.seller_id)?.full_name ||
        "Seller"
    )
  );
}

async function listSellerProductsBySeller(sellerId) {
  const supabase = ensureSupabase();
  const result = await supabase
    .from("seller_products")
    .select("id, seller_id, category_id, title, slug, description, long_description, details, ingredients, usage_notes, storage_notes, gallery_images, price_cents, currency, image_url, inventory_count, is_active, sort_order, created_at")
    .eq("seller_id", sellerId)
    .order("sort_order", { ascending: true });
  const rows = requireSingle(result, "Failed to load seller products");
  const seller = await getUserById(sellerId);

  return rows.map((row) => mapProduct(row, seller?.businessName || seller?.name || "Seller"));
}

async function createSellerProduct(input) {
  const supabase = ensureSupabase();
  const slugBase = input.slug || buildSlug(input.title);
  let slug = slugBase;
  let suffix = 1;

  for (;;) {
    const existing = await supabase
      .from("seller_products")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing.error) {
      throw new Error(`Failed to verify product slug: ${existing.error.message}`);
    }

    if (!existing.data) {
      break;
    }

    suffix += 1;
    slug = `${slugBase}-${suffix}`;
  }

  const maxSort = await supabase
    .from("seller_products")
    .select("sort_order")
    .eq("seller_id", input.sellerId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (maxSort.error) {
    throw new Error(`Failed to load seller sort order: ${maxSort.error.message}`);
  }

  const insertResult = await supabase
    .from("seller_products")
    .insert({
      seller_id: input.sellerId,
      category_id: input.categoryId,
      title: input.title,
      slug,
      description: input.description,
      long_description: input.longDescription || "",
      details: Array.isArray(input.details) ? input.details : [],
      ingredients: Array.isArray(input.ingredients) ? input.ingredients : [],
      usage_notes: input.usageNotes || "",
      storage_notes: input.storageNotes || "",
      gallery_images: Array.isArray(input.galleryImages) ? input.galleryImages : [],
      price_cents: input.priceCents,
      currency: input.currency || "LKR",
      image_url: input.imageUrl || "",
      inventory_count: input.inventoryCount,
      sort_order: (maxSort.data?.sort_order || 0) + 1
    })
    .select("id, seller_id, category_id, title, slug, description, long_description, details, ingredients, usage_notes, storage_notes, gallery_images, price_cents, currency, image_url, inventory_count, is_active, sort_order, created_at")
    .single();

  const row = requireSingle(insertResult, "Failed to create product");
  const seller = await getUserById(input.sellerId);

  return mapProduct(row, seller?.businessName || seller?.name || "Seller");
}

async function updateSellerProduct(sellerId, productId, input) {
  const supabase = ensureSupabase();
  const existing = await supabase
    .from("seller_products")
    .select("id")
    .eq("id", productId)
    .eq("seller_id", sellerId)
    .eq("is_active", true)
    .maybeSingle();
  const current = requireSingle(existing, "Failed to load product");

  if (!current) {
    throw new Error("Product not found");
  }

  const payload = {
    updated_at: new Date().toISOString()
  };

  if (input.categoryId) {
    payload.category_id = input.categoryId;
  }

  if (typeof input.title === "string") {
    payload.title = input.title;
  }

  if (typeof input.slug === "string" && input.slug.trim()) {
    payload.slug = input.slug.trim();
  }

  if (typeof input.description === "string") {
    payload.description = input.description;
  }

  if (typeof input.longDescription === "string") {
    payload.long_description = input.longDescription;
  }

  if (Array.isArray(input.details)) {
    payload.details = input.details;
  }

  if (Array.isArray(input.ingredients)) {
    payload.ingredients = input.ingredients;
  }

  if (typeof input.usageNotes === "string") {
    payload.usage_notes = input.usageNotes;
  }

  if (typeof input.storageNotes === "string") {
    payload.storage_notes = input.storageNotes;
  }

  if (Array.isArray(input.galleryImages)) {
    payload.gallery_images = input.galleryImages;
  }

  if (typeof input.priceCents === "number") {
    payload.price_cents = input.priceCents;
  }

  if (typeof input.currency === "string") {
    payload.currency = input.currency;
  }

  if (typeof input.imageUrl === "string") {
    payload.image_url = input.imageUrl;
  }

  if (typeof input.inventoryCount === "number") {
    payload.inventory_count = input.inventoryCount;
  }

  const updateResult = await supabase
    .from("seller_products")
    .update(payload)
    .eq("id", productId)
    .eq("seller_id", sellerId)
    .eq("is_active", true)
    .select("id, seller_id, category_id, title, slug, description, long_description, details, ingredients, usage_notes, storage_notes, gallery_images, price_cents, currency, image_url, inventory_count, is_active, sort_order, created_at")
    .single();
  const row = requireSingle(updateResult, "Failed to update product");
  const seller = await getUserById(sellerId);

  return mapProduct(row, seller?.businessName || seller?.name || "Seller");
}

async function deleteSellerProduct(sellerId, productId) {
  const supabase = ensureSupabase();
  const updateResult = await supabase
    .from("seller_products")
    .update({
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .eq("id", productId)
    .eq("seller_id", sellerId)
    .eq("is_active", true)
    .select("id, seller_id, category_id, title, slug, description, long_description, details, ingredients, usage_notes, storage_notes, gallery_images, price_cents, currency, image_url, inventory_count, is_active, sort_order, created_at")
    .maybeSingle();
  const row = requireSingle(updateResult, "Failed to delete product");

  if (!row) {
    throw new Error("Product not found");
  }

  const seller = await getUserById(sellerId);
  return mapProduct(row, seller?.businessName || seller?.name || "Seller");
}

async function createOrder(input) {
  const supabase = ensureSupabase();
  const customer = await getUserById(input.customerId);

  if (!customer || customer.role !== "customer") {
    throw new Error("Customer account not found");
  }

  if (!input.items.length) {
    throw new Error("Cart is empty");
  }

  const productIds = input.items.map((item) => item.productId);
  const productsResult = await supabase
    .from("seller_products")
    .select("id, seller_id, title, price_cents, currency, image_url, inventory_count, is_active")
    .in("id", productIds);
  const products = requireSingle(productsResult, "Failed to load products for order");
  const productMap = new Map(products.map((row) => [row.id, row]));

  let sellerId = null;
  const orderItems = [];

  for (const item of input.items) {
    const product = productMap.get(item.productId);

    if (!product || !product.is_active) {
      throw new Error(`Product not found: ${item.productId}`);
    }

    if (item.quantity < 1) {
      throw new Error("Quantity must be at least 1");
    }

    if (product.inventory_count < item.quantity) {
      throw new Error(`Not enough stock for ${product.title}`);
    }

    if (sellerId && sellerId !== product.seller_id) {
      throw new Error("Orders can only contain products from one seller");
    }

    sellerId = product.seller_id;
    orderItems.push({
      seller_product_id: product.id,
      title_snapshot: product.title,
      image_url_snapshot: product.image_url,
      quantity: item.quantity,
      price_cents: product.price_cents
    });
  }

  const totalCents = orderItems.reduce(
    (sum, item) => sum + item.price_cents * item.quantity,
    0
  );

  const defaultRider = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "delivery")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (defaultRider.error) {
    throw new Error(`Failed to load delivery rider: ${defaultRider.error.message}`);
  }

  const orderInsert = await supabase
    .from("orders")
      .insert({
        customer_id: input.customerId,
        seller_id: sellerId,
        delivery_rider_id: defaultRider.data?.id || null,
        status: "pending",
        delivery_status: "awaiting_assignment",
      total_cents: totalCents,
      currency: "LKR",
      recipient_name: input.recipientName || customer.name,
      delivery_address: input.deliveryAddress,
      delivery_address_line_1: input.deliveryAddressLine1 || "",
      delivery_address_line_2: input.deliveryAddressLine2 || "",
      delivery_city: input.deliveryCity || "",
      delivery_postal_code: input.deliveryPostalCode || "",
      delivery_latitude:
        input.deliveryCoordinates?.latitude !== undefined
          ? Number(input.deliveryCoordinates.latitude)
          : null,
        delivery_longitude:
          input.deliveryCoordinates?.longitude !== undefined
            ? Number(input.deliveryCoordinates.longitude)
            : null,
        notes: input.notes || "",
        cancelled_by_role: "",
        cancellation_reason: "",
        cancellation_note: "",
        cancelled_at: null
      })
      .select("id, customer_id, seller_id, delivery_rider_id, status, delivery_status, total_cents, currency, recipient_name, delivery_address, delivery_address_line_1, delivery_address_line_2, delivery_city, delivery_postal_code, delivery_latitude, delivery_longitude, notes, cancelled_by_role, cancellation_reason, cancellation_note, cancelled_at, created_at, updated_at")
      .single();
  const orderRow = requireSingle(orderInsert, "Failed to create order");

  const orderItemsInsert = await supabase
    .from("order_items")
    .insert(
      orderItems.map((item) => ({
        order_id: orderRow.id,
        ...item
      }))
    );

  if (orderItemsInsert.error) {
    throw new Error(`Failed to create order items: ${orderItemsInsert.error.message}`);
  }

  if (defaultRider.data?.id) {
    const deliveryTaskInsert = await supabase.from("delivery_tasks").insert({
      order_id: orderRow.id,
      rider_id: defaultRider.data.id,
      status: "assigned"
    });

    if (deliveryTaskInsert.error) {
      throw new Error(`Failed to create delivery task: ${deliveryTaskInsert.error.message}`);
    }
  }

  for (const item of input.items) {
    const product = productMap.get(item.productId);
    const updateResult = await supabase
      .from("seller_products")
      .update({
        inventory_count: product.inventory_count - item.quantity
      })
      .eq("id", product.id);

    if (updateResult.error) {
      throw new Error(`Failed to update stock for ${product.title}: ${updateResult.error.message}`);
    }
  }

  return (await enrichOrders([orderRow], "customer"))[0];
}

async function updateSellerOrderProgress(orderId, step, sellerId) {
  const supabase = ensureSupabase();
  const orderResult = await supabase
    .from("orders")
      .select("id, customer_id, seller_id, delivery_rider_id, status, delivery_status, total_cents, currency, recipient_name, delivery_address, delivery_address_line_1, delivery_address_line_2, delivery_city, delivery_postal_code, delivery_latitude, delivery_longitude, notes, cancelled_by_role, cancellation_reason, cancellation_note, cancelled_at, created_at, updated_at")
    .eq("id", orderId)
    .eq("seller_id", sellerId)
    .maybeSingle();
  const order = requireSingle(orderResult, "Failed to load seller order");

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status === "delivered") {
    throw new Error("Delivered orders cannot be updated by the seller");
  }

  if (order.status === "cancelled") {
    throw new Error("Cancelled orders cannot be updated by the seller");
  }

  const patch = {
    updated_at: new Date().toISOString()
  };

  if (step === "confirm") {
    if (order.status !== "pending") {
      throw new Error("Only pending orders can be confirmed");
    }

    patch.status = "processing";
  } else if (step === "ready_for_pickup") {
    if (order.delivery_status === "picked_up" || order.delivery_status === "in_transit") {
      throw new Error("This order is already with the rider");
    }

    if (order.delivery_status === "delivered") {
      throw new Error("This order has already been delivered");
    }

    if (order.status === "pending") {
      patch.status = "processing";
    }

    patch.delivery_status = "assigned";
  } else {
    throw new Error("Unsupported seller progress step");
  }

  const updateResult = await supabase
    .from("orders")
    .update(patch)
    .eq("id", orderId)
    .eq("seller_id", sellerId)
      .select("id, customer_id, seller_id, delivery_rider_id, status, delivery_status, total_cents, currency, recipient_name, delivery_address, delivery_address_line_1, delivery_address_line_2, delivery_city, delivery_postal_code, delivery_latitude, delivery_longitude, notes, cancelled_by_role, cancellation_reason, cancellation_note, cancelled_at, created_at, updated_at")
      .single();

  return (await enrichOrders([requireSingle(updateResult, "Failed to update seller order")], "seller"))[0];
}

async function cancelOrder(orderId, actor, reason, note = "") {
  if (!["customer", "seller"].includes(actor.role)) {
    throw new Error("Only customers or sellers can cancel orders");
  }

  if (!String(reason || "").trim()) {
    throw new Error("Please select a cancellation reason");
  }

  const supabase = ensureSupabase();
  let query = supabase
    .from("orders")
    .select("id, customer_id, seller_id, delivery_rider_id, status, delivery_status, total_cents, currency, recipient_name, delivery_address, delivery_address_line_1, delivery_address_line_2, delivery_city, delivery_postal_code, delivery_latitude, delivery_longitude, notes, cancelled_by_role, cancellation_reason, cancellation_note, cancelled_at, created_at, updated_at")
    .eq("id", orderId);

  if (actor.role === "customer") {
    query = query.eq("customer_id", actor.id);
  } else {
    query = query.eq("seller_id", actor.id);
  }

  const orderRow = requireSingle(await query.maybeSingle(), "Failed to load order");

  assertOrderCancellable(orderRow);

  const orderItems = requireSingle(
    await supabase
      .from("order_items")
      .select("seller_product_id, quantity")
      .eq("order_id", orderId),
    "Failed to load order items"
  );

  for (const item of orderItems) {
    const productResult = await supabase
      .from("seller_products")
      .select("id, inventory_count")
      .eq("id", item.seller_product_id)
      .maybeSingle();
    const product = requireSingle(productResult, "Failed to load product stock");

    if (!product) {
      continue;
    }

    const updateResult = await supabase
      .from("seller_products")
      .update({
        inventory_count: product.inventory_count + item.quantity
      })
      .eq("id", item.seller_product_id);

    if (updateResult.error) {
      throw new Error(`Failed to restore stock: ${updateResult.error.message}`);
    }
  }

  const deleteTasks = await supabase.from("delivery_tasks").delete().eq("order_id", orderId);

  if (deleteTasks.error) {
    throw new Error(`Failed to clear delivery task: ${deleteTasks.error.message}`);
  }

  const updateResult = await supabase
    .from("orders")
    .update({
      status: "cancelled",
      delivery_status: "cancelled",
      cancelled_by_role: actor.role,
      cancellation_reason: String(reason).trim(),
      cancellation_note: String(note || "").trim(),
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq("id", orderId)
    .select("id, customer_id, seller_id, delivery_rider_id, status, delivery_status, total_cents, currency, recipient_name, delivery_address, delivery_address_line_1, delivery_address_line_2, delivery_city, delivery_postal_code, delivery_latitude, delivery_longitude, notes, cancelled_by_role, cancellation_reason, cancellation_note, cancelled_at, created_at, updated_at")
    .single();

  return (await enrichOrders([requireSingle(updateResult, "Failed to cancel order")], actor.role))[0];
}

async function listOrdersForUser(user) {
  const supabase = ensureSupabase();
  let query = supabase
    .from("orders")
      .select("id, customer_id, seller_id, delivery_rider_id, status, delivery_status, total_cents, currency, recipient_name, delivery_address, delivery_address_line_1, delivery_address_line_2, delivery_city, delivery_postal_code, delivery_latitude, delivery_longitude, notes, cancelled_by_role, cancellation_reason, cancellation_note, cancelled_at, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (user.role === "customer") {
    query = query.eq("customer_id", user.id);
  }

  if (user.role === "seller") {
    query = query.eq("seller_id", user.id);
  }

  if (user.role === "delivery") {
    query = query.eq("delivery_rider_id", user.id);
  }

  const rows = requireSingle(await query, "Failed to load orders");
  return enrichOrders(rows, user.role);
}

async function listDeliveryTasksForUser(userId) {
  const supabase = ensureSupabase();
  const tasksResult = await supabase
    .from("delivery_tasks")
    .select("id, order_id, rider_id, status, created_at, updated_at")
    .eq("rider_id", userId)
    .order("created_at", { ascending: false });
  const tasks = requireSingle(tasksResult, "Failed to load delivery tasks");

  const orderIds = tasks.map((task) => task.order_id);
  const ordersResult = await supabase
    .from("orders")
      .select("id, customer_id, seller_id, delivery_rider_id, status, delivery_status, total_cents, currency, recipient_name, delivery_address, delivery_address_line_1, delivery_address_line_2, delivery_city, delivery_postal_code, delivery_latitude, delivery_longitude, notes, cancelled_by_role, cancellation_reason, cancellation_note, cancelled_at, created_at, updated_at")
    .in("id", orderIds);
  const orders = orderIds.length
    ? await enrichOrders(requireSingle(ordersResult, "Failed to load delivery orders"), "delivery")
    : [];
  const orderMap = new Map(orders.map((order) => [order.id, order]));

  return tasks.map((task) => ({
    id: task.id,
    orderId: task.order_id,
    riderId: task.rider_id,
    status: task.status,
    createdAt: task.created_at,
    updatedAt: task.updated_at,
    order: orderMap.get(task.order_id) || null
  }));
}

async function updateDeliveryTaskStatus(taskId, status, riderId) {
  const supabase = ensureSupabase();
  const currentTaskResult = await supabase
    .from("delivery_tasks")
    .select("id, order_id, rider_id, status, created_at, updated_at")
    .eq("id", taskId)
    .eq("rider_id", riderId)
    .maybeSingle();
  const currentTask = requireSingle(currentTaskResult, "Failed to load delivery task");

  if (!currentTask) {
    throw new Error("Delivery task not found");
  }

  const currentOrderResult = await supabase
    .from("orders")
    .select("id, delivery_status, status")
    .eq("id", currentTask.order_id)
    .maybeSingle();
  const currentOrder = requireSingle(currentOrderResult, "Failed to load delivery order");

    if (!currentOrder) {
      throw new Error("Order not found");
    }

    if (currentOrder.status === "cancelled" || currentOrder.delivery_status === "cancelled") {
      throw new Error("Cancelled orders cannot be updated");
    }

  if (status === "picked_up" && currentOrder.delivery_status !== "assigned") {
    throw new Error("Seller has not marked this order ready for pickup yet");
  }

  if (status === "in_transit" && currentOrder.delivery_status !== "picked_up") {
    throw new Error("Mark the order as picked up before starting delivery");
  }

  if (status === "delivered" && currentOrder.delivery_status !== "in_transit") {
    throw new Error("Mark the order as in transit before completing delivery");
  }

  const taskResult = await supabase
    .from("delivery_tasks")
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq("id", taskId)
    .eq("rider_id", riderId)
    .select("id, order_id, rider_id, status, created_at, updated_at")
    .maybeSingle();
  const task = requireSingle(taskResult, "Failed to update delivery task");

  if (!task) {
    throw new Error("Delivery task not found");
  }

  const orderPatch = {
    delivery_status: status,
    updated_at: new Date().toISOString()
  };

  if (status === "picked_up" || status === "in_transit") {
    orderPatch.status = "out_for_delivery";
  }

  if (status === "delivered") {
    orderPatch.status = "delivered";
  }

  const orderUpdate = await supabase
    .from("orders")
    .update(orderPatch)
    .eq("id", task.order_id)
      .select("id, customer_id, seller_id, delivery_rider_id, status, delivery_status, total_cents, currency, recipient_name, delivery_address, delivery_address_line_1, delivery_address_line_2, delivery_city, delivery_postal_code, delivery_latitude, delivery_longitude, notes, cancelled_by_role, cancellation_reason, cancellation_note, cancelled_at, created_at, updated_at")
      .single();
  const order = (await enrichOrders([requireSingle(orderUpdate, "Failed to update order")], "delivery"))[0];

  return {
    id: task.id,
    orderId: task.order_id,
    riderId: task.rider_id,
    status: task.status,
    createdAt: task.created_at,
    updatedAt: task.updated_at,
    order
  };
}

async function deleteListingsForSeller(sellerId) {
  const supabase = ensureSupabase();
  const result = await supabase
    .from("seller_products")
    .update({
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .eq("seller_id", sellerId)
    .eq("is_active", true);

  if (result.error) {
    throw new Error(`Failed to delete listings: ${result.error.message}`);
  }
}

async function deleteStoreByOwner(sellerId) {
  const supabase = ensureSupabase();
  const result = await supabase.from("profiles").delete().eq("id", sellerId);

  if (result.error) {
    throw new Error(`Failed to delete store: ${result.error.message}`);
  }
}

async function deleteUserAccount(userId) {
  const supabase = ensureSupabase();
  const result = await supabase.from("profiles").delete().eq("id", userId);

  if (result.error) {
    throw new Error(`Failed to delete account: ${result.error.message}`);
  }
}

module.exports = {
  authenticateUser,
  createOrder,
  cancelOrder,
  createSellerProduct,
  createUser,
  deleteSellerProduct,
  deleteListingsForSeller,
  deleteStoreByOwner,
  deleteUserAccount,
  getUserById,
  isSupabaseConfigured,
  listActiveSellerProducts,
  listCategories,
  listDeliveryTasksForUser,
  listOrdersForUser,
  listSellerProductsBySeller,
  listUsers,
  updateSellerOrderProgress,
  updateSellerProduct,
  updateUserProfile,
  updateDeliveryTaskStatus
};
