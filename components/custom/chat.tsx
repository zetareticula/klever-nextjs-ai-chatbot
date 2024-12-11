"use client";

import { Attachment, Message } from "ai";
import { useChat } from "ai/react";
import { useState } from "react";

import { Message as PreviewMessage } from "@/components/custom/message";
import { useScrollToBottom } from "@/components/custom/use-scroll-to-bottom";

import { MultimodalInput } from "./multimodal-input";
import { Overview } from "./overview";

// Chat component
// The chat component is a container for the chat messages and the input area.
// It is responsible for rendering the messages and the input area.
export function Chat({
  id,
  initialMessages,
}: {
  id: string;
  initialMessages: Array<Message>;
}) {
  // The useChat hook is used to manage the chat state.
  // It provides methods for sending messages and handling the chat lifecycle.
  const { messages, handleSubmit, input, setInput, append, isLoading, stop } =
    useChat({
      body: { id },
      initialMessages,
      onFinish: () => {
        window.history.replaceState({}, "", `/chat/${id}`);
      },
    });

    // The useScrollToBottom hook is used to scroll the messages container to the bottom when new messages are added.
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

    // The attachments state is used to store the attachments added to the input area.
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  return (
    <div className="flex flex-col justify-center items-center h-full bg-gradient-to-b from-[#FFF3E0] via-[#FFEBCC] to-[#FFDB99] px-4 py-6 md:py-8">
      {/* Chat Container */}
      <div className="flex flex-col w-full max-w-3xl gap-4 h-full">
        {/* Messages Area */}
        <div
          ref={messagesContainerRef}
          className="flex-1 flex flex-col gap-4 overflow-y-auto p-4 bg-white rounded-lg shadow-md"
        >
          {messages.length === 0 && <Overview />}
          {messages.map((message) => (
            <PreviewMessage
              key={message.id}
              role={message.role}
              content={message.content}
              attachments={message.experimental_attachments}
              toolInvocations={message.toolInvocations}
            />
          ))}
          <div ref={messagesEndRef} className="h-[1px]" />
        </div>

        {/* Input Area */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex items-end gap-2"
        >
          <MultimodalInput
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            stop={stop}
            attachments={attachments}
            setAttachments={setAttachments}
            messages={messages}
            append={append}
          />
        </form>
      </div>
    </div>
  );
}