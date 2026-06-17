"use client";

import { useCallback, useRef } from "react";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputTools,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionAddAttachments,
  PromptInputActionAddScreenshot,
  usePromptInputController,
} from "@/components/ai-elements/prompt-input";
import { SpeechInput } from "@/components/ai-elements/speech-input";
import { AttachmentsDisplay } from "./chat-attachments";

interface ChatInputProps {
  status: string;
  onSubmit: (message: { text: string }) => void;
}

// Must be rendered inside <PromptInputProvider>
export const ChatInput = ({ status, onSubmit }: ChatInputProps) => {
  const controller = usePromptInputController();
  const speechAccumulatorRef = useRef("");

  const handleTranscriptionChange = useCallback(
    (text: string) => {
      const accumulated = speechAccumulatorRef.current
        ? `${speechAccumulatorRef.current} ${text.trim()}`
        : text.trim();
      speechAccumulatorRef.current = accumulated;
      controller.textInput.setInput(accumulated);
    },
    [controller.textInput],
  );

  const isStreaming = status === "streaming";

  return (
    <PromptInput
      globalDrop
      multiple
      onSubmit={(message) => {
        onSubmit({ text: message.text });
        speechAccumulatorRef.current = "";
      }}
      className="w-full relative rounded-2xl border shadow-sm"
    >
      <PromptInputBody>
        <AttachmentsDisplay />
        <PromptInputTextarea
          placeholder="Ask Khuki anything..."
          // disabled={isStreaming}
        />
      </PromptInputBody>
      <PromptInputFooter>
        <PromptInputTools>
          <PromptInputActionMenu>
            <PromptInputActionMenuTrigger type="button" />
            <PromptInputActionMenuContent>
              <PromptInputActionAddAttachments />
              <PromptInputActionAddScreenshot />
            </PromptInputActionMenuContent>
          </PromptInputActionMenu>
          <SpeechInput
            disabled={isStreaming}
            size="icon"
            variant="ghost"
            className="bg-transparent text-muted-foreground"
            type="button"
            lang="bn-BD"
            onTranscriptionChange={handleTranscriptionChange}
          />
        </PromptInputTools>
        <PromptInputSubmit
          status={isStreaming ? "streaming" : "ready"}
          disabled={!controller.textInput.value.trim()}
          className="absolute bottom-1 right-1"
        />
      </PromptInputFooter>
    </PromptInput>
  );
};
