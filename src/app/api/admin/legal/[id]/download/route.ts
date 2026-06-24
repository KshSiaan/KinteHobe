import { legalDocument } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSupabaseStorageClient } from "@/lib/storage/supabase";
import { eq } from "drizzle-orm";

const BUCKET = "legal-documents";
const SIGNED_URL_EXPIRES_IN = 60; // seconds

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
	const { data, error } = await storage
		.from(BUCKET)
		.createSignedUrl(target.filePath, SIGNED_URL_EXPIRES_IN, {
			download: target.fileName,
		});

	if (error || !data?.signedUrl) {
		return Response.json(
			{ message: "Failed to generate download URL", error: error?.message },
			{ status: 500 },
		);
	}

	return Response.redirect(data.signedUrl, 302);
}
