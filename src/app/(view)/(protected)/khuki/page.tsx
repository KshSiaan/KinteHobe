"use client";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { PromptInputProvider } from "@/components/ai-elements/prompt-input";
import { DefaultChatTransport } from "ai";
import { useChat } from "@ai-sdk/react";
import { ChatHeader } from "./_components/chat-header";
import { ChatEmptyState } from "./_components/empty-state";
import { ChatMessageRow, BotTypingRow } from "./_components/chat-message";
import { ChatInput } from "./_components/chat-input";

export default function Page() {
  const { messages, sendMessage, status, regenerate } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isStreaming = status === "streaming";
  const lastMessage = messages[messages.length - 1];
  const showTypingRow = isStreaming && lastMessage?.role === "user";

  return (
    <main className="px-4 h-[86dvh] py-4 flex items-start gap-4 container mx-auto">
      <section className="w-1/2 h-full border rounded-lg hidden" />

      <div className="flex-1 h-full flex flex-col rounded-xl border bg-background overflow-hidden shadow-sm">
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
