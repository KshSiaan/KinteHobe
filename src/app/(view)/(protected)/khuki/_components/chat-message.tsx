"use client";

import { Fragment, memo, useCallback } from "react";
import Image from "next/image";
import { CopyIcon, RefreshCcwIcon } from "lucide-react";
import type { UIMessage } from "ai";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageResponse,
  MessageActions,
  MessageAction,
} from "@/components/ai-elements/message";
import { TypingIndicator } from "./typing-indicator";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

const BotAvatar = () => (
  <Avatar size="sm" className="shrink-0 shadow-sm">
    <AvatarImage src="/assistant-icon.webp" alt="Khuki" />
    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xs font-bold">
      K
    </AvatarFallback>
  </Avatar>
);

const UserAvatar = () => {
  const { data } = authClient.useSession();
  return (
    <Avatar size="sm" className="shrink-0 shadow-sm">
      <AvatarImage
        src={data?.user?.image || undefined}
        alt={data?.user?.name || "User"}
      />
      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-xs font-bold">
        U
      </AvatarFallback>
    </Avatar>
  );
};

export const BotTypingRow = () => (
  <div className="flex items-end gap-2.5">
    <BotAvatar />
    <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
      <TypingIndicator />
    </div>
  </div>
);

interface ChatMessageRowProps {
  message: UIMessage;
  isLast: boolean;
  status: string;
  onRegenerate: () => void;
}

export const ChatMessageRow = memo(
  ({ message, isLast, status, onRegenerate }: ChatMessageRowProps) => {
    const isUser = message.role === "user";

    return (
      <>
        {message.parts.map((part, i) => {
          if (part.type !== "text") return null;

          const isActivelyStreaming =
            status === "streaming" && isLast && !isUser;
          const showTypingDots = isActivelyStreaming && !part.text;

          const handleCopy = () => navigator.clipboard.writeText(part.text);

          return (
            <Fragment key={`${message.id}-${i}`}>
              <div
                className={cn(
                  "flex items-end gap-2.5",
                  isUser && "flex-row-reverse",
                )}
              >
                {isUser ? <UserAvatar /> : <BotAvatar />}
                <div
                  className={cn(
                    "max-w-[72%] rounded-2xl text-sm leading-relaxed px-4 py-2.5",
                    isUser
                      ? "rounded-tr-sm bg-primary text-primary-foreground"
                      : "rounded-tl-sm bg-muted text-foreground",
                  )}
                >
                  {showTypingDots ? (
                    <TypingIndicator />
                  ) : (
                    <MessageResponse>{part.text}</MessageResponse>
                  )}
                </div>
              </div>
              {!isUser && isLast && part.text && !isActivelyStreaming && (
                <div className="ml-9">
                  <MessageActions>
                    <MessageAction
                      onClick={onRegenerate}
                      label="Retry"
                      tooltip="Regenerate response"
                    >
                      <RefreshCcwIcon className="size-3" />
                    </MessageAction>
                    <MessageAction
                      onClick={handleCopy}
                      label="Copy"
                      tooltip="Copy to clipboard"
                    >
                      <CopyIcon className="size-3" />
                    </MessageAction>
                  </MessageActions>
                </div>
              )}
            </Fragment>
          );
        })}
      </>
    );
  },
);

ChatMessageRow.displayName = "ChatMessageRow";
