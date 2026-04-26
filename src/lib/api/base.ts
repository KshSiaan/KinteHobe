import { CategoryType } from "@/types/schemas";
import { CreateResponseType } from "../backend/message";


export async function getCategories():Promise<CreateResponseType<{data:CategoryType}>> {
    const response = await fetch("/api/category");
    return response.json();
}