"use client";

import { useRef } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { PromptInputProvider } from "@/components/ai-elements/prompt-input";
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import { useChat } from "@ai-sdk/react";
import { ChatHeader } from "./_components/chat-header";
import { ChatEmptyState } from "./_components/empty-state";
import { ChatMessageRow, BotTypingRow } from "./_components/chat-message";
import { ChatInput } from "./_components/chat-input";

export default function Page() {
  //! derive type directly from useChat so ref stays in sync with SDK changes
  const addToolOutputRef = useRef<ReturnType<typeof useChat>["addToolOutput"] | null>(null);

  //! onToolCall handles client-side tools — AI calls triggerTask, frontend executes it
  const { messages, sendMessage, status, regenerate, addToolOutput } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    //! required — triggers new request after all client-side tool outputs are provided
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onToolCall: ({ toolCall }) => {
      if (toolCall.toolName === "triggerTask") {
        //! UIMessage tool calls use `input` not `args` — cast to extract payload
        const tc = toolCall as unknown as {
          toolCallId: string;
          input: { key: string; description: string; value: unknown };
        };
        const { key, value } = tc.input;

        //! dispatch tasks by key — add more cases here as needed
        if (key === "showMessage") {
          console.log(value);
        }

        //! feed result back so SDK can continue conversation — prevents AI_MissingToolResultsError
        addToolOutputRef.current?.({
          tool: "triggerTask",
          toolCallId: tc.toolCallId,
          output: "Task executed",
        });
      }
    },
  });

  //! sync ref every render so closure always has current addToolOutput
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addToolOutputRef.current = addToolOutput as any;

  const isStreaming = status === "streaming";
  const lastMessage = messages[messages.length - 1];
  const showTypingRow = isStreaming && lastMessage?.role === "user";

  return (
    <main className="px-4 h-[86dvh] py-4 flex items-start gap-4 container mx-auto">
      <section className="w-1/2 h-full border rounded-lg hidden" />

      <div className="flex-1 h-full flex flex-col rounded-xl bg-background overflow-hidden">
        <ChatHeader status={status} />

        <Conversation className="min-h-0">
          <ConversationContent className="gap-4 py-4 px-3">
            {messages.length === 0 && !isStreaming && (
              <ChatEmptyState onSuggest={(text) => sendMessage({ text })} />
            )}
            {messages.map((message, i) => (
              <ChatMessageRow
                key={message.id}
                message={message}
                isLast={i === messages.length - 1}
                status={status}
                onRegenerate={regenerate}
              />
            ))}
            {showTypingRow && <BotTypingRow />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="p-3 border-t bg-background/95 shrink-0">
          <PromptInputProvider>
            <ChatInput status={status} onSubmit={sendMessage} />
          </PromptInputProvider>
        </div>
      </div>
    </main>
  );
}
