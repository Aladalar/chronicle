// Hardcoded DM login helper for now — no auth UI yet.
// Replace with real auth later.

const BASE = import.meta.env.VITE_API_URL || "";
let token = localStorage.getItem("chronicle_jwt");

export function setToken(t) {
  token = t;
  if (t) localStorage.setItem("chronicle_jwt", t);
  else localStorage.removeItem("chronicle_jwt");
}
export function getToken() { return token; }

export async function api(method, path, body) {
  const opts = { method, headers: { "Content-Type": "application/json" } };
  if (token) opts.headers["Authorization"] = `Bearer ${token}`;
  if (body && method !== "GET") opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE}/api/v1${path}`, opts);
  if (res.status === 401) {
    setToken(null);
    throw new Error("Not authenticated");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// Quick DM login helper — call from console if needed
export async function loginAsDM(username, password) {
  const res = await api("POST", "/auth/login", { username, password });
  setToken(res.token);
  return res;
}

// Expose for console debugging
if (typeof window !== "undefined") {
  window.chronicle = { api, setToken, loginAsDM };
}
