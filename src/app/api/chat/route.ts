import fs from 'node:fs/promises';
import { convertToModelMessages, isLoopFinished, streamText, tool, wrapLanguageModel, type ToolSet, type UIMessage } from 'ai';
// import { google } from '@ai-sdk/google';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { devToolsMiddleware } from '@ai-sdk/devtools';
import z from 'zod';
import { systemPrompt } from './system';
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});
const model = wrapLanguageModel({
  model: openrouter("openai/gpt-oss-120b:free"),
  middleware: devToolsMiddleware(),
});


//! triggerTask is a client-side tool (no execute) — AI SDK routes it to frontend via onToolCall
const tools:ToolSet = {
    triggerTask: tool({
        description: "Trigger a UI task on the frontend. Use this to instruct the UI to perform an action. and always follow up with a text response to the user after calling this tool. never end your turn with only a tool call — always provide a text reply summarizing or using the tool result.",
        inputSchema: z.object({
            key: z.string().describe("keep it 'showMessage' always"),
            description: z.string().describe("Human-readable description of what this task does"),
            value: z.any().describe("Payload for the task — string, number, object, etc."),
        }),
        // No execute — client handles this via onToolCall
    }),
    getProducts: tool({
        description:"Fetches a list of all products available on the platform, including their IDs, slugs, titles, descriptions, categories, statuses, variant IDs, creation and update timestamps, and variant details such as prices, stock quantities, weights, metadata, positions, kinds, enabled statuses, titles, option names, images, and public images.",
        inputSchema: z.object({}),
        execute: async () => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product`);
            const data = await res.json();
            console.log("Trying to fetch products from API:", res.url);
            return data;
        },
    }),
    pageRoutes: tool({
        description:"Fetches a list of all page routes for redirection and linking, including their slugs and titles. dont give out page routes that are not meant for public access. Only provide routes that are accessible to users. always provide full links to the pages, including the domain name. If the page is not accessible to users, do not provide the route.",
        inputSchema: z.object({}),
        execute: async () => {
            const res = await fs.readFile(`${process.cwd()}/ROUTING.md`, {
                encoding: "utf8",
            });
            return res;
        }

            
    })
}


export async function POST(request: Request) {
    const { messages }: { messages: UIMessage[] } = await request.json();
    const result = streamText({
        model:process.env.NODE_ENV === "development" ?  model:openrouter("openai/gpt-oss-120b:free"),
        tools,
        stopWhen:isLoopFinished(),
        system: systemPrompt,
        messages: await convertToModelMessages(messages),
    })

    return result.toUIMessageStreamResponse();
}

