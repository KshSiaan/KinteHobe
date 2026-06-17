"use client";
import React, { memo, useCallback } from "react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
} from "@/components/ai-elements/conversation";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputBody,
  PromptInputProvider,
  PromptInputFooter,
  PromptInputTools,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionAddAttachments,
  PromptInputActionAddScreenshot,
  usePromptInputAttachments,
} from "@/components/ai-elements/prompt-input";
import Image from "next/image";
import {
  Attachment,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from "@/components/ai-elements/attachments";
import type { AttachmentData } from "@/components/ai-elements/attachments";

interface AttachmentItemProps {
  attachment: AttachmentData;
  onRemove: (id: string) => void;
}
const AttachmentItem = memo(({ attachment, onRemove }: AttachmentItemProps) => {
  const handleRemove = useCallback(
    () => onRemove(attachment.id),
    [onRemove, attachment.id],
  );
  return (
    <Attachment data={attachment} key={attachment.id} onRemove={handleRemove}>
      <AttachmentPreview />
      <AttachmentRemove />
    </Attachment>
  );
});

AttachmentItem.displayName = "AttachmentItem";

const PromptInputAttachmentsDisplay = () => {
  const attachments = usePromptInputAttachments();

  const handleRemove = useCallback(
    (id: string) => attachments.remove(id),
    [attachments],
  );

  if (attachments.files.length === 0) {
    return null;
  }

  return (
    <Attachments variant="inline">
      {attachments.files.map((attachment) => (
        <AttachmentItem
          attachment={attachment}
          key={attachment.id}
          onRemove={handleRemove}
        />
      ))}
    </Attachments>
  );
};

export default function Page() {
  const [input, setInput] = React.useState("");
  return (
    <main className="px-4 h-[86dvh] py-4 flex flex-col">
      <div className="flex-1 w-full p-4 flex flex-col">
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
        <PromptInputProvider>
          <PromptInput
            globalDrop
            multiple
            onSubmit={(message) => {
              console.log("New message submitted:", message);
            }}
            className="mt-4 w-full max-w-2xl mx-auto relative rounded-2xl"
          >
            <PromptInputBody>
              <PromptInputAttachmentsDisplay />
              <PromptInputTextarea
                value={input}
                placeholder="Say something..."
                onChange={(e) => setInput(e.currentTarget.value)}
              />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger />
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments />
                    <PromptInputActionAddScreenshot />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>
              </PromptInputTools>
              <PromptInputSubmit
                //   status={status === "streaming" ? "streaming" : "ready"}
                disabled={!input.trim()}
                className="absolute bottom-1 right-1"
              />
            </PromptInputFooter>
          </PromptInput>
        </PromptInputProvider>
      </div>
    </main>
  );
}
