import fs from "node:fs/promises";
import { tool, ToolSet } from "ai";
import z from "zod";
import { searchLegalDocument, searchSimilarProducts } from "./embed-operations";

//! triggerTask is a client-side tool (no execute) — AI SDK routes it to frontend via onToolCall
export const tools: ToolSet = {
  triggerTask: tool({
    description:
      "Trigger a UI task on the frontend. Use this to instruct the UI to perform an action. and always follow up with a text response to the user after calling this tool. never end your turn with only a tool call — always provide a text reply summarizing or using the tool result.",
    inputSchema: z.object({
      key: z.string().describe("keep it 'showMessage' always"),
      description: z
        .string()
        .describe("Human-readable description of what this task does"),
      value: z
        .any()
        .describe("Payload for the task — string, number, object, etc."),
    }),
  }),

  getProducts: tool({
    description:
      "Fetches a list of all products available on the platform, including their IDs, slugs, titles, descriptions, categories, statuses, variant IDs, creation and update timestamps, and variant details such as prices, stock quantities, weights, metadata, positions, kinds, enabled statuses, titles, option names, images, and public images.",
    inputSchema: z.object({}),
    execute: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product`);
      const data = await res.json();
      return data;
    },
  }),

  getSpecificProduct: tool({
    description:
      "Fetches detailed information about a specific product based its slug",
    inputSchema: z.object({
      query: z
        .string()
        .describe(
          "The search query to find relevant product information in the vector database. This should be a string that represents the product or related keywords you want to search for.",
        ),
      limit: z
        .number()
        .default(5)
        .describe(
          "The maximum number of relevant product information results to return. Only if user explicitly specifies a limit, otherwise default is 5.",
        ),
      threshold: z
        .number()
        .default(0.5)
        .describe(
          "The similarity threshold for filtering relevant product information. Only if user explicitly specifies a threshold, otherwise default is 0.5.",
        ),
    }),

    execute: async ({ query, limit, threshold }) => {
      try {
        const result = await searchSimilarProducts(query, limit, threshold);

        if (result.length === 0) {
          return "No relevant information found in the knowledge base.";
        }
        const formattedResult = result
          .map(
            (r, i) =>
              `[${i + 1}] ${r.content} (similarity: ${r.similarity.toFixed(2)})`,
          )
          .join("\n\n");
        return formattedResult;
      } catch (error) {
        console.error("Error executing searchKnowledgeBase tool:", error);
        throw new Error("Failed to execute searchKnowledgeBase tool");
      }
    },
  }),

  getLegalPages: tool({
    description:
      "Get Any Legal Pages simply judging by users query such as 'privacy policy', 'terms of service', 'cookie policy' etc. and return the content of the legal page.",
    inputSchema: z.object({
      query: z
        .string()
        .describe("The search query to find relevant legal information."),
    }),
    execute: async ({ query }) => {
      try {
        const result = await searchLegalDocument(query);
        console.log("Legal Pages Search Result:", result);
        return result;
      } catch (error) {
        console.error("Error executing getLegalPages tool:", error);
        throw new Error("Failed to execute getLegalPages tool");
      }
    },
  }),

  pageRoutes: tool({
    description:
      "Fetches a list of all page routes for redirection and linking, including their slugs and titles. dont give out page routes that are not meant for public access. Only provide routes that are accessible to users. always provide full links to the pages, including the domain name. If the page is not accessible to users, do not provide the route.",
    inputSchema: z.object({}),
    execute: async () => {
      const res = await fs.readFile(`${process.cwd()}/ROUTING.md`, {
        encoding: "utf8",
      });
      return res;
    },
  }),
};
