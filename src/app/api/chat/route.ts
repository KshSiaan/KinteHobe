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
import { systemPrompt } from "./system";
import { tools } from "./tools";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(request: Request) {
  const { messages }: { messages: UIMessage[] } = await request.json();
  const result = streamText({
    model: openrouter("nvidia/nemotron-3-super-120b-a12b:free"),
    tools,
    stopWhen: isLoopFinished(),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
