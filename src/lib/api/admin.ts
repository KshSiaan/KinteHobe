"use client"

import { CreateResponseType } from "../backend/message";

export type CreateCategoryPayload = FormData;

type CreateCategoryResponse = {
    message?: string;
};

export async function createCategory(values: CreateCategoryPayload) {
    const response = await fetch("/api/admin/category", {
        method: "POST",
        body: values,
    });

    const contentType = response.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");

    if (!response.ok) {
        if (isJson) {
            const data = (await response.json()) as { message?: string };
            throw new Error(data.message ?? "Failed to create category");
        }

        const text = await response.text();
        throw new Error(text || "Failed to create category");
    }

    if (!isJson) {
        return { message: await response.text() } satisfies CreateCategoryResponse;
    }

    return (await response.json()) as CreateCategoryResponse;
}

export type DeleteCategoryPayload = {
    id: string;
};

// export async function deleteCategory({ id }: DeleteCategoryPayload) {
//     const response = await fetch(`/api/admin/category/${id}`, {
//         method: "DELETE",
//     });

//     return await response.json() as CreateResponseType;
// }
