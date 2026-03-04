const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const { body, method = "GET", token } = options;
  const headers = {
    "Content-Type": "application/json"
  };

  if (token) {
    headers.authorization = `Bearer ${token}`;
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

export async function apiGet(path, token) {
  return request(path, { method: "GET", token });
}

export async function apiPost(path, body, token) {
  return request(path, { method: "POST", body, token });
}

export async function apiPatch(path, body, token) {
  return request(path, { method: "PATCH", body, token });
}

export async function apiDelete(path, token) {
  return request(path, { method: "DELETE", token });
}

export async function login(payload) {
  return apiPost("/auth/login", payload);
}

export async function register(payload) {
  return apiPost("/auth/register", payload);
}

export async function getProfile(token) {
  const response = await apiGet("/auth/profile", token);
  return response.data;
}

export async function updateProfile(payload, token) {
  const response = await apiPatch("/auth/profile", payload, token);
  return response.data;
}

export async function deleteAccount(token) {
  return apiDelete("/auth/account", token);
}

export async function deleteStore(token) {
  return apiDelete("/auth/store", token);
}

export async function deleteListings(token) {
  return apiDelete("/auth/listings", token);
}

export async function getCatalog() {
  const response = await apiGet("/products");
  return response.data;
}

export async function getCategories() {
  const response = await apiGet("/products/categories");
  return response.data;
}

export async function getSellerProducts(token) {
  const response = await apiGet("/products/mine", token);
  return response.data;
}

export async function createSellerProduct(payload, token) {
  const response = await apiPost("/products", payload, token);
  return response.data;
}

export async function updateSellerProduct(productId, payload, token) {
  const response = await apiPatch(`/products/${productId}`, payload, token);
  return response.data;
}

export async function deleteSellerProduct(productId, token) {
  const response = await apiDelete(`/products/${productId}`, token);
  return response.data;
}

export async function getOrders(token) {
  const response = await apiGet("/orders", token);
  return response.data;
}

export async function createOrder(payload, token) {
  const response = await apiPost("/orders", payload, token);
  return response.data;
}

export async function updateSellerOrderProgress(orderId, step, token) {
  const response = await apiPatch(
    `/orders/${orderId}/seller-progress`,
    { step },
    token
  );
  return response.data;
}

export async function cancelOrder(orderId, reason, note, token) {
  const response = await apiPatch(
    `/orders/${orderId}/cancel`,
    { reason, note },
    token
  );
  return response.data;
}

export async function getDeliveries(token) {
  const response = await apiGet("/delivery", token);
  return response.data;
}

export async function updateDeliveryStatus(deliveryId, status, token) {
  const response = await apiPatch(
    `/delivery/${deliveryId}/status`,
    { status },
    token
  );
  return response.data;
}
