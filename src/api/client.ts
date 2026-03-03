import { z } from "zod";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

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

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  let payload: unknown = null;
  if (response.status !== 204) {
    try {
      payload = isJson ? await response.json() : await response.text();
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    let message = `Request failed with ${response.status}`;
    if (payload && typeof payload === "object") {
      const errorPayload = payload as Record<string, unknown>;
      if (typeof errorPayload.message === "string" && errorPayload.message.trim()) {
        message = errorPayload.message;
      } else if (typeof errorPayload.error === "string" && errorPayload.error.trim()) {
        message = errorPayload.error;
      }
    } else if (typeof payload === "string" && payload.trim()) {
      if (payload.includes("<!doctype") || payload.includes("<html")) {
        message = "API returned HTML instead of JSON. Check VITE_API_BASE_URL/backend availability.";
      } else {
        message = payload.slice(0, 180);
      }
    }
    throw new ApiError(response.status, message);
  }

  if (payload == null) {
    return null;
  }
  if (!isJson) {
    if (typeof payload === "string" && (payload.includes("<!doctype") || payload.includes("<html"))) {
      throw new ApiError(502, "API returned HTML instead of JSON. Check VITE_API_BASE_URL/backend availability.");
    }
    return payload;
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: unknown }).data;
  }
  return payload;
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
