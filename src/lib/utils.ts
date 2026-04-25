import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ApiClientOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  token?: string;
  headers?: Record<string, string>;
  content?: string
}

export async function howl<T>(
  endpoint: string,
  { method = "GET", body, token, content, headers = {} }: ApiClientOptions = {}
): Promise<T> {
  const res = await fetch(endpoint, {
    method,
    headers: {
      "Accept": "application/json",
      ...(content ? { "Content-Type": content } : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.log(errorData);
    
    throw new Error((errorData as any).message || "API request failed");
  }
  return res.json() as Promise<T>;
}