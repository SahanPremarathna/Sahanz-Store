const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const { body, method = "GET", user } = options;
  const headers = {
    "Content-Type": "application/json"
  };

  if (user?.id) {
    headers["x-demo-user-id"] = user.id;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;

    try {
      const payload = await response.json();
      errorMessage = payload.error || payload.message || errorMessage;
    } catch (_error) {
      // Ignore JSON parse failures and fall back to status text.
    }

    throw new Error(errorMessage);
  }

  return response.json();
}

export async function apiGet(path, user) {
  return request(path, { method: "GET", user });
}

export async function apiPost(path, body, user) {
  return request(path, { method: "POST", body, user });
}

export async function apiPatch(path, body, user) {
  return request(path, { method: "PATCH", body, user });
}

export async function getDemoUsers() {
  const response = await apiGet("/auth/users");
  return response.data;
}

export async function loginDemo(userId) {
  return apiPost("/auth/login", { userId });
}

export async function getProfile(user) {
  const response = await apiGet("/auth/profile", user);
  return response.data;
}

export async function updateProfile(payload, user) {
  const response = await apiPatch("/auth/profile", payload, user);
  return response.data;
}

export async function getCatalog() {
  const response = await apiGet("/products");
  return response.data;
}

export async function getCategories() {
  const response = await apiGet("/products/categories");
  return response.data;
}

export async function getSellerProducts(user) {
  const response = await apiGet("/products/mine", user);
  return response.data;
}

export async function createSellerProduct(payload, user) {
  const response = await apiPost("/products", payload, user);
  return response.data;
}

export async function getOrders(user) {
  const response = await apiGet("/orders", user);
  return response.data;
}

export async function createOrder(payload, user) {
  const response = await apiPost("/orders", payload, user);
  return response.data;
}

export async function updateSellerOrderProgress(orderId, step, user) {
  const response = await apiPatch(
    `/orders/${orderId}/seller-progress`,
    { step },
    user
  );
  return response.data;
}

export async function getDeliveries(user) {
  const response = await apiGet("/delivery", user);
  return response.data;
}

export async function updateDeliveryStatus(deliveryId, status, user) {
  const response = await apiPatch(
    `/delivery/${deliveryId}/status`,
    { status },
    user
  );
  return response.data;
}
