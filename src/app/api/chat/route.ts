import {
  convertToModelMessages,
  isLoopFinished,
  streamText,
  type UIMessage,
} from "ai";
// import { google } from '@ai-sdk/google';
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
// import { devToolsMiddleware } from '@ai-sdk/devtools';
import z from "zod";
import { getSystemPrompt } from "./system";
import { tools } from "./tools";
import * as Sentry from "@sentry/nextjs";
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(request: Request) {
  const { messages, config }: { messages: UIMessage[]; config: string } =
    await request.json();

  if (!messages || !Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!config || typeof config !== "string") {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  Sentry.logger.info("Chat request received", { messages, config });
  const result = streamText({
    model: openrouter("nvidia/nemotron-3-super-120b-a12b:free"),
    tools,
    stopWhen: isLoopFinished(),
    system: getSystemPrompt(config),
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
