const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:18080";

// WS_BASE prefers an explicit NEXT_PUBLIC_WS_URL but otherwise derives the
// websocket origin from NEXT_PUBLIC_API_URL (https → wss, http → ws). This
// way a single env var configures both surfaces in production.
export const WS_BASE: string = (() => {
  if (process.env.NEXT_PUBLIC_WS_URL) return process.env.NEXT_PUBLIC_WS_URL;
  if (API.startsWith("https://")) return "wss://" + API.slice("https://".length);
  if (API.startsWith("http://")) return "ws://" + API.slice("http://".length);
  return API;
})();

let accessToken: string | null = null;
let refreshInFlight: Promise<string | null> | null = null;

export class AuthRequiredError extends Error {
  constructor(message = "auth required") {
    super(message);
    this.name = "AuthRequiredError";
  }
}

export function setAccessToken(t: string | null) {
  accessToken = t;
  // Hand the token to the AutoApply browser extension so it can poll on the
  // user's behalf (extension-as-worker architecture). The extension's content
  // script listens for these events on this origin and forwards them to its
  // background service worker. No-op if the extension isn't installed.
  if (typeof window !== "undefined") {
    if (t) {
      window.dispatchEvent(
        new CustomEvent("AUTOAPPLY_SET_TOKEN", { detail: { token: t } }),
      );
    } else {
      window.dispatchEvent(new CustomEvent("AUTOAPPLY_CLEAR_TOKEN"));
    }
  }
}

export function getAccessToken(): string | null {
  return accessToken;
}

// logout POSTs /auth/logout (best-effort — server revokes the refresh token
// chain and clears the `rt` cookie) and then drops the in-memory access
// token. Returns once the server has responded so the caller can safely
// redirect to /login without a race against an in-flight refresh.
export async function logout(): Promise<void> {
  try {
    await fetch(`${API}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    // network error is non-fatal — we still want to clear local state
  }
  accessToken = null;
}

// refreshAccessToken POSTs /auth/refresh and stores the new access token.
// Concurrent callers share the same in-flight promise so we never present the
// same refresh-cookie twice — the backend treats a re-presented token as
// reuse and revokes the whole chain.
export async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    try {
      const r = await fetch(`${API}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!r.ok) {
        accessToken = null;
        return null;
      }
      const { accessToken: newT } = (await r.json()) as { accessToken: string };
      accessToken = newT;
      return newT;
    } catch {
      accessToken = null;
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

// Endpoints where a 401 is the meaningful response (bad creds, expired refresh
// cookie) — not a signal to try refreshing. Refreshing here would either loop
// or mask the real error.
const NO_REFRESH_PATHS = new Set([
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/logout",
  "/auth/verify-linkedin",
]);

async function readError(res: Response): Promise<string> {
  const text = await res.text().catch(() => "");
  if (!text) return res.statusText || `HTTP ${res.status}`;
  try {
    const j = JSON.parse(text) as {
      error?: string;
      message?: string;
      reason?: string;
    };
    return j.error || j.message || j.reason || text;
  } catch {
    return text;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const send = async (token: string | null) => {
    const headers = new Headers(init.headers);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (init.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    return fetch(`${API}${path}`, { ...init, headers, credentials: "include" });
  };

  let res = await send(accessToken);

  if (res.status === 401 && !NO_REFRESH_PATHS.has(path)) {
    const newT = await refreshAccessToken();
    if (newT) {
      res = await send(newT);
    } else {
      // refresh itself failed — caller can catch AuthRequiredError and redirect
      throw new AuthRequiredError();
    }
  }

  if (!res.ok) {
    throw new Error(await readError(res));
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
