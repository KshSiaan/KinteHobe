"use server";

import { PDFParse } from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { embed, embedMany } from "ai";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function generateEmbedding(doc: File) {
  const bytes = await doc.arrayBuffer();

  const processedPDF = new PDFParse(new Uint8Array(bytes));
  const data = await processedPDF.getText();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1200,
    chunkOverlap: 100,
  });

  const texts = await splitter.splitText(data.text);

  const result = await embedMany({
    model: openrouter.textEmbeddingModel("nvidia/nemotron-3-embed-1b:free"),
    values: texts,
  });

  // Reduce each embedding from 2048 dimensions to 1028 dimensions
  const embeddings = result.embeddings.map((embedding) =>
    embedding.slice(0, 1028),
  );

  return {
    chunks: texts,
    embeddings,
  };
}

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

  // Reduce each embedding from 2048 dimensions to 1028 dimensions
  const embeddings = result.embeddings.map((embedding) =>
    embedding.slice(0, 1028),
  );

  return {
    chunks: texts,
    embeddings,
  };
}

export async function generateEmbeddingFromTextSingle(text: string) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1200,
    chunkOverlap: 100,
  });

  const texts = await splitter.splitText(text);

  const result = await embedMany({
    model: openrouter.textEmbeddingModel("nvidia/nemotron-3-embed-1b:free"),
    values: texts,
  });

  const embeddings = result.embeddings.map((embedding) => {
    if (embedding.length !== 2048) {
      throw new Error(`Expected 2048 dimensions, got ${embedding.length}`);
    }

    return embedding.slice(0, 1028);
  });

  return {
    chunks: texts,
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
