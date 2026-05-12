const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8100";

let accessToken: string | null = null;

export function setAccessToken(t: string | null) {
  accessToken = t;
}

export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let res = await fetch(`${API}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  // One-shot refresh on 401
  if (res.status === 401 && path !== "/auth/refresh") {
    const r = await fetch(`${API}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (r.ok) {
      const { accessToken: newT } = (await r.json()) as { accessToken: string };
      setAccessToken(newT);
      headers.set("Authorization", `Bearer ${newT}`);
      res = await fetch(`${API}${path}`, {
        ...init,
        headers,
        credentials: "include",
      });
    }
  }

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
