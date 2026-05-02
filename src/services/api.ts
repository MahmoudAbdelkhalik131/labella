import { toast } from "sonner";

const API_BASE =
  (import.meta.env.VITE_API_BASE as string | undefined)?.trim() ||
  "http://localhost:4000";
const API_PREFIX = `${API_BASE}/api/v1`;
const TOKEN_KEY = "labella_token";
console.log("API_BASE:", API_BASE);

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY) || readCookie("token"),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

function readCookie(name: string) {
  if (typeof document === "undefined") return null;
  const value = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
  return value ? decodeURIComponent(value) : null;
}

function errorMessage(body: unknown) {
  if (body && typeof body === "object") {
    const b = body as { errors?: { msg?: string }[]; message?: string };
    return b.errors?.[0]?.msg || b.message;
  }
  return undefined;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  usePrefix = true,
): Promise<T> {
  const token = tokenStore.get();
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData))
    headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  headers.set("ngrok-skip-browser-warning", "true");
  const lang = localStorage.getItem("labella_lang") || "en";
  const url = new URL(`${usePrefix ? API_PREFIX : API_BASE}${path}`);
  url.searchParams.set("language", lang.toLowerCase());
  const response = await fetch(url.toString(), { ...options, headers });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = errorMessage(body) || "Something went wrong";
    toast.error(message);
    throw new Error(message);
  }
  return body as T;
}

function serializeBody(body?: unknown) {
  if (body instanceof FormData) return body;
  return JSON.stringify(body ?? {});
}

export const api = {
  imgUrl: (path: string | undefined, fallback = "/placeholder.svg") => {
    if (!path) return fallback;
    if (path.startsWith("http")) return path;
    const type = path.startsWith("category-") ? "categories" : "products";
    return `${API_BASE}/images/${type}/${path}`;
  },
  userImg: (path: string | undefined) => {
    if (!path) return "/user-default.jpg";
    if (path.startsWith("http")) return path;
    return `${API_BASE}/images/users/${path}`;
  },
  login: (body: { email: string; password: string }, admin = false) =>
    apiFetch<{ data: unknown; token: string }>(
      `/auth/login${admin ? "/admin" : ""}`,
      { method: "POST", body: JSON.stringify(body) },
    ),
  signup: (body: unknown) =>
    apiFetch("/auth/signup", { method: "POST", body: JSON.stringify(body) }),
  forgot: (email: string) =>
    apiFetch<{ message: string; Token: string }>("/auth/forget-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  verifyCode: (resetToken: string, resetcode: string) =>
    apiFetch("/auth/verify-code", {
      method: "POST",
      headers: { Authorization: `Bearer ${resetToken}` },
      body: JSON.stringify({ resetcode }),
    }),
  resetPassword: (
    resetToken: string,
    body: { password: string; confirmPassword: string },
  ) =>
    apiFetch("/auth/reset-password", {
      method: "POST",
      headers: { Authorization: `Bearer ${resetToken}` },
      body: JSON.stringify(body),
    }),
  google: () => {
    window.location.href = `${API_BASE}/auth/google`;
  },
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "POST", body: serializeBody(body) }),
  put: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "PUT", body: serializeBody(body) }),
  patch: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "PATCH", body: serializeBody(body) }),
  del: <T>(path: string) => apiFetch<T>(path, { method: "DELETE" }),
};
