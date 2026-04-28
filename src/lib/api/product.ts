"use client";

type CreateProductResponse = {
  message?: string;
};

export type CreateProductPayload = FormData;

export async function createProduct(values: CreateProductPayload) {
  const response = await fetch("/api/manage/product", {
    method: "POST",
    body: values,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  if (!response.ok) {
    if (isJson) {
      const data = (await response.json()) as { message?: string };
      throw new Error(data.message ?? "Failed to create product");
    }

    const text = await response.text();
    throw new Error(text || "Failed to create product");
  }

  if (!isJson) {
    return { message: await response.text() } satisfies CreateProductResponse;
  }

  return (await response.json()) as CreateProductResponse;
}