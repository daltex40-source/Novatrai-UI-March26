import { z } from "zod";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
};

function getAuthToken() {
  try {
    return window.localStorage.getItem("novatrai_token");
  } catch {
    return null;
  }
}

async function request(path: string, options?: RequestOptions): Promise<unknown> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE}${path}`, {
    method: options?.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options?.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  const json: unknown = await response.json();
  if (json && typeof json === "object" && "data" in json) {
    return (json as { data: unknown }).data;
  }
  return json;
}

export async function apiGet<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  const data = await request(path, { method: "GET" });
  return schema.parse(data);
}

export async function apiGetRaw(path: string): Promise<unknown> {
  return request(path, { method: "GET" });
}

export async function apiPostRaw(path: string, body?: unknown): Promise<unknown> {
  return request(path, { method: "POST", body });
}

export async function apiPost<T>(path: string, body: unknown, schema: z.ZodType<T>): Promise<T> {
  const data = await request(path, { method: "POST", body });
  return schema.parse(data);
}
