import { legalDocument } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { asc, desc } from "drizzle-orm";

export async function GET(request: Request) {
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session?.user) {
		return Response.json({ message: "Unauthorized" }, { status: 401 });
	}

	if (session.user.role !== "admin") {
		return Response.json({ message: "Forbidden" }, { status: 403 });
	}

	const docs = await db
		.select()
		.from(legalDocument)
		.orderBy(asc(legalDocument.pageType), desc(legalDocument.uploadedAt));

	return Response.json({ docs }, { status: 200 });
}
