/**
 * React API Service for NIVORA Healthcare
 * Handles authenticated backend API calls using JWT token from localStorage
 */

const TOKEN_KEY = "nivora_token";

export const setAuthToken = (token: string) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("token");
  }
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem("token");
};

export const removeAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("token");
};

/**
 * Generic fetch wrapper with Authorization Bearer header
 */
export const apiFetch = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers
  });

  const contentType = res.headers.get("content-type") || "";
  let data: any = null;

  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    const text = await res.text();
    console.warn(`Non-JSON response from ${url}:`, text);
    throw new Error(res.status === 404 ? "Endpoint not found (404)" : `Server error (${res.status})`);
  }

  if (!res.ok) {
    throw new Error(data?.message || `Request failed with status ${res.status}`);
  }

  return data;
};

/**
 * Specific Healthcare API Services
 */
export const apiService = {
  // User Appointments & Orders
  getMyOrders: async () => {
    return await apiFetch("/api/orders/my");
  },

  // Admin All Orders
  getAllAdminOrders: async () => {
    return await apiFetch("/api/admin/orders");
  },

  getOrderById: async (id: string) => {
    return await apiFetch(`/api/orders/${encodeURIComponent(id)}`);
  },

  createOrder: async (orderData: any) => {
    return await apiFetch("/api/orders", {
      method: "POST",
      body: JSON.stringify(orderData)
    });
  },

  // Auth Services
  login: async (credentials: { email: string; password?: string }) => {
    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials)
    });
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  register: async (userData: any) => {
    const data = await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData)
    });
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  logout: () => {
    removeAuthToken();
  }
};
