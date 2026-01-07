
const API_URL = "http://localhost:8000";

const getTokens = () => ({
  access: localStorage.getItem("access_token"),
  refresh: localStorage.getItem("refresh_token"),
});

const setTokens = (access: string, refresh: string) => {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
};

const refreshToken = async () => {
  const { refresh } = getTokens();
  if (!refresh) throw new Error("No refresh token available");

  const res = await fetch(`${API_URL}/api/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) throw new Error("Failed to refresh token");

  const data = await res.json();
  setTokens(data.access, data.refresh || refresh);
  return data.access;
};

export const apiFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("access_token");

  const headers: any = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  
  if (token && !url.includes("/login") && !url.includes("/register")) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res = await fetch(`${API_URL}${url}`, { ...options, headers });

  if (res.status === 401 && !url.includes("/login") && !url.includes("/register")) {
    try {
      const newAccess = await refreshToken();
      headers["Authorization"] = `Bearer ${newAccess}`;
      res = await fetch(`${API_URL}${url}`, { ...options, headers });
    } catch (err) {
      // Refresh failed, clear tokens
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      throw err;
    }
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP error! status: ${res.status}, ${text}`);
  }

  return res.json();
};
