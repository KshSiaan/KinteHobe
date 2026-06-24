import { legalDocument } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session?.user) {
		return Response.json({ message: "Unauthorized" }, { status: 401 });
	}

	if (session.user.role !== "admin") {
		return Response.json({ message: "Forbidden" }, { status: 403 });
	}

	const { id } = await params;

	const [target] = await db
		.select()
		.from(legalDocument)
		.where(eq(legalDocument.id, id))
		.limit(1);

	if (!target) {
		return Response.json({ message: "Document not found" }, { status: 404 });
	}

	// Deactivate all docs of same page type, then activate this one
	await db
		.update(legalDocument)
		.set({ isActive: false })
		.where(eq(legalDocument.pageType, target.pageType));

	await db.update(legalDocument).set({ isActive: true }).where(eq(legalDocument.id, id));

	return Response.json({ message: "Document activated" }, { status: 200 });
}
