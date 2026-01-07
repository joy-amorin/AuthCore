
const API_URL = "http://localhost:8000";

interface RequestOptions extends RequestInit {
  body?: any;
}

export async function apiFetch(endpoint: string, options: RequestOptions = {}) {
  const accessToken = localStorage.getItem("access_token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    // handle 401 to refresh token later
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}
