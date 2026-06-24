import { legalDocument, legalPageTypeEnum } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSupabaseStorageClient } from "@/lib/storage/supabase";
import { eq } from "drizzle-orm";
import { z } from "zod";

const BUCKET = "legal-documents";
const MAX_BYTES = 30 * 1024 * 1024; // 30 MB

const uploadSchema = z.object({
	pageType: z.enum(legalPageTypeEnum.enumValues),
});

export async function POST(request: Request) {
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session?.user) {
		return Response.json({ message: "Unauthorized" }, { status: 401 });
	}

	if (session.user.role !== "admin") {
		return Response.json({ message: "Forbidden" }, { status: 403 });
	}

	const formData = await request.formData();
	const file = formData.get("file");
	const pageTypeRaw = formData.get("pageType");

	if (!(file instanceof File)) {
		return Response.json({ message: "file is required" }, { status: 400 });
	}

	const parsed = uploadSchema.safeParse({ pageType: pageTypeRaw });
	if (!parsed.success) {
		return Response.json(
			{ message: "Invalid pageType", issues: z.flattenError(parsed.error).fieldErrors },
			{ status: 400 },
		);
	}

	const { pageType } = parsed.data;

	if (file.type !== "application/pdf") {
		return Response.json({ message: "Only PDF files are allowed" }, { status: 400 });
	}

	if (!file.name.toLowerCase().endsWith(".pdf")) {
		return Response.json({ message: "Only PDF files are allowed" }, { status: 400 });
	}

	if (file.size > MAX_BYTES) {
		return Response.json(
			{ message: `File exceeds 30 MB limit (${(file.size / 1024 / 1024).toFixed(2)} MB)` },
			{ status: 400 },
		);
	}

	if (file.size === 0) {
		return Response.json({ message: "File is empty" }, { status: 400 });
	}

	const timestamp = Date.now();
	const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
	const storagePath = `${pageType}/${timestamp}_${safeName}`;

	const storage = getSupabaseStorageClient().storage;
	const { error: uploadError } = await storage.from(BUCKET).upload(storagePath, file, {
		contentType: "application/pdf",
		upsert: false,
	});

	if (uploadError) {
		return Response.json(
			{ message: "Storage upload failed", error: uploadError.message },
			{ status: 500 },
		);
	}

	try {
		const [doc] = await db
			.insert(legalDocument)
			.values({
				pageType,
				fileName: file.name,
				filePath: storagePath,
				fileSize: file.size,
				isActive: false,
				uploadedBy: session.user.id,
			})
			.returning();

		// If this is the first doc for this page type, auto-activate it
		const existing = await db
			.select({ id: legalDocument.id })
			.from(legalDocument)
			.where(eq(legalDocument.pageType, pageType));

		if (existing.length === 1) {
			await db
				.update(legalDocument)
				.set({ isActive: true })
				.where(eq(legalDocument.id, doc.id));
			doc.isActive = true;
		}

		return Response.json({ message: "Uploaded successfully", doc }, { status: 201 });
	} catch {
		// Rollback storage upload on DB failure
		await storage.from(BUCKET).remove([storagePath]);
		return Response.json({ message: "Database insert failed" }, { status: 500 });
	}
}
