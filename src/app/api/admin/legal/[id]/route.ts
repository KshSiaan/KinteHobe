import { legalDocument } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSupabaseStorageClient } from "@/lib/storage/supabase";
import { eq } from "drizzle-orm";

const BUCKET = "legal-documents";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

	const storage = getSupabaseStorageClient().storage;
	const { error: storageError } = await storage.from(BUCKET).remove([target.filePath]);

	if (storageError) {
		return Response.json(
			{ message: "Storage delete failed", error: storageError.message },
			{ status: 500 },
		);
	}

	await db.delete(legalDocument).where(eq(legalDocument.id, id));

	return Response.json({ message: "Document deleted" }, { status: 200 });
}
