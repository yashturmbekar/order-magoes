import { config } from "./config";

const API_BASE = config.API_BASE;

export async function apiRequest(
  path,
  method = "GET",
  body = null,
  token = null
) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${path}`, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "API request failed");
  }

  return response.json();
}

export async function loginAdmin(credentials) {
  return await apiRequest("/auth/login", "POST", credentials);
}

export async function getAllOrders(token) {
  return await apiRequest("/admin/orders", "GET", null, token);
}

export async function getOrderByPhone(phoneNumber, token) {
  return await apiRequest(`/orders/phone/${phoneNumber}`, "GET", null, token);
}

export async function updateOrder(orderId, orderData, token) {
  return await apiRequest(`/admin/orders/${orderId}`, 'PATCH', orderData, token);
}

export async function createOrder(data) {
  return await apiRequest('/admin/orders', 'POST', data);
}

export async function cancelOrder(orderId, token) {
  return await apiRequest(`/admin/orders/${orderId}/cancel`, 'PATCH', null, token);
}

export async function activateOrder(orderId, token) {
  return await apiRequest(`/admin/orders/${orderId}/activate`, 'PATCH', null, token);
}


