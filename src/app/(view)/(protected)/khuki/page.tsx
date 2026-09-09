"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { PromptInputProvider } from "@/components/ai-elements/prompt-input";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import { useChat } from "@ai-sdk/react";
import { ChatHeader } from "./_components/chat-header";
import { ChatEmptyState } from "./_components/empty-state";
import { ChatMessageRow, BotTypingRow } from "./_components/chat-message";
import { ChatInput } from "./_components/chat-input";
import { useSearchParams } from "next/navigation";
import { getStoredAgentConfig, type AgentConfig } from "@/lib/ai/agent-config";
import { Button } from "@/components/ui/button";
import { MaximizeIcon, MinimizeIcon } from "lucide-react";

export default function Page() {
  const chatPanelRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [agentConfig, setAgentConfig] = useState<AgentConfig>(() =>
    getStoredAgentConfig(),
  );

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === chatPanelRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (document.fullscreenElement === chatPanelRef.current) {
      await document.exitFullscreen();
      return;
    }

    await chatPanelRef.current?.requestFullscreen();
  }, []);

  useEffect(() => {
    const refreshConfig = () => setAgentConfig(getStoredAgentConfig());
    window.addEventListener("storage", refreshConfig);
    refreshConfig();

    return () => window.removeEventListener("storage", refreshConfig);
  }, []);

  //! derive type directly from useChat so ref stays in sync with SDK changes
  const addToolOutputRef = useRef<
    ReturnType<typeof useChat>["addToolOutput"] | null
  >(null);

  //! onToolCall handles client-side tools — AI calls triggerTask, frontend executes it
  const { messages, sendMessage, status, regenerate, addToolOutput } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: () => ({ config: JSON.stringify(agentConfig) }),
    }),
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

  const q = useSearchParams().get("q");

  const sendWithConfig = useCallback(
    (message: { text: string }) => {
      sendMessage(message, {
        body: { config: JSON.stringify(getStoredAgentConfig()) },
      });
    },
    [sendMessage],
  );

  //record search query to database via worker thread if q is present
  const recordSearchQuery = useCallback(async (query: string) => {
    await fetch(`/api/client/record/ai`, {
      method: "POST",
      body: JSON.stringify({ q: query }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }, []);

  const recordedQueries = useRef(new Set<string>());

  useEffect(() => {
    if (!q || recordedQueries.current.has(q)) return;

    recordedQueries.current.add(q);

    sendWithConfig({ text: q });
    recordSearchQuery(q);
  }, [q, recordSearchQuery, sendWithConfig]);

  // biome-ignore lint/suspicious/noExplicitAny:sdsd
  addToolOutputRef.current = addToolOutput as any;

  const isStreaming = status === "streaming";
  const lastMessage = messages[messages.length - 1];
  const showTypingRow = isStreaming && lastMessage?.role === "user";

  return (
    <main className="px-4 h-[86dvh] py-4 flex items-start gap-4 container mx-auto">
      <section className="w-1/2 h-full border rounded-lg hidden" />
      <div
        ref={chatPanelRef}
        className={`flex-1 h-full flex flex-col rounded-xl bg-background overflow-hidden ${
          isFullscreen ? "p-3 md:p-6" : ""
        }`}
      >
        <div className="w-full flex items-center justify-between">
          <ChatHeader status={status} />

          <Button
            size="icon"
            variant="ghost"
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <MinimizeIcon /> : <MaximizeIcon />}
          </Button>
        </div>

        <Conversation className="min-h-0">
          <ConversationContent className="gap-4 py-4 px-3">
            {messages.length === 0 && !isStreaming && (
              <ChatEmptyState onSuggest={(text) => sendWithConfig({ text })} />
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
            <ChatInput status={status} onSubmit={sendWithConfig} />
          </PromptInputProvider>
        </div>
      </div>
    </main>
  );
}
