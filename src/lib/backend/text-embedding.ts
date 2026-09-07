"use server";

import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { embed, embedMany } from "ai";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function generateEmbeddingFromText(text: string) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1200,
    chunkOverlap: 100,
  });

  const texts = await splitter.splitText(text);
  const result = await embedMany({
    model: openrouter.textEmbeddingModel("nvidia/nemotron-3-embed-1b:free"),
    values: texts,
  });

  return {
    chunks: texts,
    embeddings: result.embeddings.map((embedding) => embedding.slice(0, 1028)),
  };
}

export async function generateEmbeddingFromTextSingle(text: string) {
  const result = await generateEmbeddingFromText(text);

  const embeddings = result.embeddings.map((embedding) => {
    if (embedding.length !== 1028) {
      throw new Error(`Expected 1028 dimensions, got ${embedding.length}`);
    }

    return embedding;
  });

  return {
    chunks: result.chunks,
    embeddings,
  };
}

export async function generateQueryEmbedding(text: string) {
  const result = await embed({
    model: openrouter.textEmbeddingModel("nvidia/nemotron-3-embed-1b:free"),
    value: text,
  });

  if (result.embedding.length !== 2048) {
    throw new Error(`Expected 2048 dimensions, got ${result.embedding.length}`);
  }

  return result.embedding.slice(0, 1028);
}
