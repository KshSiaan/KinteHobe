"use client";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
} from "@/components/ai-elements/conversation";

import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { ScreenShareIcon } from "lucide-react";
import { usePathname } from "next/navigation";

export default function AiAssistant() {
  const path = usePathname();
  const [input, setInput] = useState("");

  if (path === "/khuki") {
    return null; // Don't render the popover if we're already on the chat page
  }
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="fixed bottom-4 right-4 size-18 p-2! bg-white! overflow-hidden shadow-lg rounded-full">
          <Image
            src="/assistant-icon.webp"
            alt="Assistant"
            width={248}
            height={248}
            className="object-contain size-full rounded-full"
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent side="top" align="end" className="w-[20dvw] h-[60dvh]">
        <PopoverHeader className="flex flex-row w-full items-center justify-between">
          <PopoverTitle>Khuki AI</PopoverTitle>
          <Button size="icon" variant="ghost" asChild>
            <Link href="/khuki">
              <ScreenShareIcon />
            </Link>
          </Button>
        </PopoverHeader>
        <div className="flex-1 w-full bg-muted rounded-xl shadow-inner p-4 flex flex-col">
          <Conversation>
            <ConversationContent>
              <ConversationEmptyState
                title="No conversation yet"
                description="Start a new conversation by typing a message below."
                icon={
                  <Image
                    src="/assistant-icon.webp"
                    alt="Assistant"
                    width={248}
                    height={248}
                    className="size-12 rounded-lg shadow-lg"
                  />
                }
              />
            </ConversationContent>
          </Conversation>
          <PromptInput
            onSubmit={(message) => {
              console.log("New message submitted:", message);
            }}
            className="mt-4 w-full max-w-2xl mx-auto relative rounded-2xl p-0! shadow"
          >
            <PromptInputTextarea
              value={input}
              placeholder="Say something..."
              onChange={(e) => setInput(e.currentTarget.value)}
              className="pr-12 bg-background border-0! ring-0!"
            />
            <PromptInputSubmit
              //   status={status === "streaming" ? "streaming" : "ready"}
              disabled={!input.trim()}
              className="absolute bottom-1 right-1"
            />
          </PromptInput>
        </div>
      </PopoverContent>
    </Popover>
  );
}
