// API Client Utility with JWT Authorization header injection and 401 interceptor handling

export function getStoredToken(): string | null {
  return localStorage.getItem("nivora_token") || 
         sessionStorage.getItem("nivora_token") || 
         localStorage.getItem("token");
}

export function setStoredToken(token: string, rememberMe = true): void {
  if (rememberMe) {
    localStorage.setItem("nivora_token", token);
    localStorage.setItem("token", token);
  } else {
    sessionStorage.setItem("nivora_token", token);
    localStorage.removeItem("nivora_token");
    localStorage.removeItem("token");
  }
}

export function clearStoredToken(): void {
  localStorage.removeItem("nivora_token");
  sessionStorage.removeItem("nivora_token");
  localStorage.removeItem("token");
  localStorage.removeItem("nivora_admin_user");
}

export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!headers.has("Content-Type") && options.body && typeof options.body === "string" && options.body.startsWith("{")) {
    headers.set("Content-Type", "application/json");
  }

  const updatedOptions: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(url, updatedOptions);

  // Auto handle 401 Unauthorized or Token Expired
  if (response.status === 401) {
    clearStoredToken();
    if (window.location.pathname.startsWith("/admin") && window.location.pathname !== "/admin/login") {
      window.location.href = "/admin/login?expired=1";
    }
  }

  return response;
}
