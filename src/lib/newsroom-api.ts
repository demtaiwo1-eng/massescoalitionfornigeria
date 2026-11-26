export const MCN_API_URL = "https://mcn-newsroom-api.onrender.com";

export async function newsroomRequest<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${MCN_API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
  return payload as T;
}
