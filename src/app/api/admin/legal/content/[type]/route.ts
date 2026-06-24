import { legalContent, legalPageTypeEnum } from "@/db/schema";
import { LEGAL_PAGE_META } from "@/lib/legal";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type LegalPageType = (typeof legalPageTypeEnum.enumValues)[number];

const VALID_TYPES = new Set<string>(legalPageTypeEnum.enumValues);

function isValidType(v: string): v is LegalPageType {
	return VALID_TYPES.has(v);
}

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ type: string }> },
) {
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session?.user) {
		return Response.json({ message: "Unauthorized" }, { status: 401 });
	}

	if (session.user.role !== "admin") {
		return Response.json({ message: "Forbidden" }, { status: 403 });
	}

	const { type } = await params;

	if (!isValidType(type)) {
		return Response.json({ message: "Invalid page type" }, { status: 400 });
	}

	const [row] = await db
		.select()
		.from(legalContent)
		.where(eq(legalContent.pageType, type))
		.limit(1);

	return Response.json({ content: row ?? null }, { status: 200 });
}

export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ type: string }> },
) {
	const session = await auth.api.getSession({ headers: request.headers });

	if (!session?.user) {
		return Response.json({ message: "Unauthorized" }, { status: 401 });
	}

	if (session.user.role !== "admin") {
		return Response.json({ message: "Forbidden" }, { status: 403 });
	}

	const { type } = await params;

	if (!isValidType(type)) {
		return Response.json({ message: "Invalid page type" }, { status: 400 });
	}

	const body = await request.json();
	const { title, content, metaDescription, isPublished } = body as {
		title: string;
		content: string;
		metaDescription: string;
		isPublished: boolean;
	};

	if (typeof title !== "string" || typeof content !== "string") {
		return Response.json({ message: "Invalid body" }, { status: 400 });
	}

	const [existing] = await db
		.select({ id: legalContent.id })
		.from(legalContent)
		.where(eq(legalContent.pageType, type))
		.limit(1);

	if (existing) {
		const [updated] = await db
			.update(legalContent)
			.set({
				title,
				content,
				metaDescription: metaDescription ?? "",
				isPublished: Boolean(isPublished),
				updatedAt: new Date(),
				updatedBy: session.user.id,
			})
			.where(eq(legalContent.id, existing.id))
			.returning();
		revalidatePath(`/${LEGAL_PAGE_META[type].slug}`);
		return Response.json({ content: updated }, { status: 200 });
	}

	const [inserted] = await db
		.insert(legalContent)
		.values({
			pageType: type,
			title,
			content,
			metaDescription: metaDescription ?? "",
			isPublished: Boolean(isPublished),
			updatedBy: session.user.id,
		})
		.returning();
	revalidatePath(`/${LEGAL_PAGE_META[type].slug}`);
	return Response.json({ content: inserted }, { status: 201 });
}
