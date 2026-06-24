import { legalDocument } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSupabaseStorageClient } from "@/lib/storage/supabase";
import { eq } from "drizzle-orm";

const BUCKET = "legal-documents";
const SIGNED_URL_EXPIRES_IN = 300; // 5 minutes for viewing

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
		.createSignedUrl(target.filePath, SIGNED_URL_EXPIRES_IN);

	if (error || !data?.signedUrl) {
		return Response.json(
			{ message: "Failed to generate view URL", error: error?.message },
			{ status: 500 },
		);
	}

	return Response.json({ url: data.signedUrl, fileName: target.fileName }, { status: 200 });
}
