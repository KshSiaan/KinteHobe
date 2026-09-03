import { legalEmbed, productEmbed } from "@/db/schema";
import { generateQueryEmbedding } from "@/lib/backend/chunker";
import { db } from "@/lib/db";
import { cosineDistance, desc, gt, sql } from "drizzle-orm";
import * as Sentry from "@sentry/nextjs";
export async function searchSimilarProducts(
  query: string,
  limit: number = 5,
  threshold: number = 0.5,
) {
  const embedding = await generateQueryEmbedding(query);

  const similarity = sql<number>`
    1 - (${cosineDistance(productEmbed.embedding, embedding)})
  `;

  const similarDocs = await db
    .select({
      id: productEmbed.id,
      content: productEmbed.content,
      similarity,
    })
    .from(productEmbed)
    .where(gt(similarity, threshold))
    .orderBy(desc(similarity))
    .limit(limit);

  return similarDocs;
}

export async function searchLegalDocument(query: string) {
  const embedding = await generateQueryEmbedding(query);
  console.log("Generated embedding for query:", embedding);
  const similarity = sql<number>`
    1 - (${cosineDistance(legalEmbed.embedding, embedding)})
  `;

  const similarDocs = await db
    .select({
      id: legalEmbed.id,
      content: legalEmbed.content,
      similarity,
    })
    .from(legalEmbed)
    .where(gt(similarity, 0.5))
    .orderBy(desc(similarity))
    .limit(5);
  console.log("Similar legal documents found:", similarDocs);
  return similarDocs;
}
