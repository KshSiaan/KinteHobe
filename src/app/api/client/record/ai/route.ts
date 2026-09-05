import { NextRequest } from "next/server";
import path from "node:path";
import { Worker } from "node:worker_threads";

//* Record an AI search
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { q } = body;
  try {
    if (!q?.trim()) {
      return new Response("Missing search query", { status: 400 });
    }

    const headers = Object.fromEntries(req.headers.entries());

    const workerPath = path.join(process.cwd(), "workers", "search-worker.js");
    const worker = new Worker(workerPath);
    worker.postMessage({
      q,
      headers,
      type: "ai",
    });
  } catch (error) {
    console.error("Error parsing request body:", error);
    return new Response("Invalid request body", { status: 400 });
  }

  return new Response("Search query recorded successfully", { status: 200 });
}
