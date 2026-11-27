export const MCN_API_URL = "https://mcn-newsroom-api.onrender.com";

export async function newsroomRequest<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? window.sessionStorage.getItem("mcn_session_token") : null;
  const headers: Record<string,string> = { "Content-Type": "application/json", ...((options.headers || {}) as Record<string,string>) };
  if (token) headers.Authorization = "Bearer " + token;
  const response = await fetch(MCN_API_URL + path, {
    ...options,
    credentials: "include",
    headers
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Request failed (" + response.status + ")");
  if (typeof window !== "undefined" && path === "/api/auth/login" && payload.token) {
    window.sessionStorage.setItem("mcn_session_token", payload.token);
  }
  if (typeof window !== "undefined" && path === "/api/auth/logout") {
    window.sessionStorage.removeItem("mcn_session_token");
  }
  return payload as T;
}
