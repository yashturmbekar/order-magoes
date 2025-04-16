import axios from "axios";
import { config } from "./config";

const API_BASE = config.API_BASE;

const api = axios.create({
  baseURL: API_BASE,
});

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (newAccessToken) => {
  refreshSubscribers.forEach((callback) => callback(newAccessToken));
  refreshSubscribers = [];
};

api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshToken = localStorage.getItem("refreshToken");
          const response = await axios.post(`${API_BASE}/auth/refresh`, {
            refreshToken,
          });
          const newAccessToken = response.data.accessToken;
          localStorage.setItem("accessToken", newAccessToken);
          isRefreshing = false;
          onRefreshed(newAccessToken);
        } catch (err) {
          isRefreshing = false;
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/admin/login";
          return Promise.reject(err);
        }
      }

      return new Promise((resolve) => {
        subscribeTokenRefresh((newAccessToken) => {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          resolve(api(originalRequest));
        });
      });
    }
    return Promise.reject(error);
  }
);

export const loginAdmin = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  localStorage.setItem("accessToken", response.data.accessToken);
  // Set refreshToken into a secure HttpOnly cookie
  document.cookie = `refreshToken=${response.data.refreshToken}; HttpOnly; Secure; SameSite=Strict; path=/`;
  return response.data;
};

export async function getAllOrders(token) {
  return await api.get("/admin/orders", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getOrderByPhone(phoneNumber) {
  return await api.get(`/admin/orders/details/${phoneNumber}`);
}

export async function updateOrder(orderId, orderData, token) {
  return await api.patch(`/admin/orders/${orderId}`, orderData, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createOrder(data) {
  return await api.post("/admin/orders", data);
}

export async function cancelOrder(orderId, token) {
  return await api.patch(`/admin/orders/${orderId}/cancel`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function activateOrder(orderId, token) {
  return await api.patch(`/admin/orders/${orderId}/activate`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export default api;
