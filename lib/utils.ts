import {
  CoreMessage,
  CoreToolMessage,
  generateId,
  Message,
  ToolInvocation,
} from "ai";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { Chat } from "@/db/schema";

// for cn function to merge tailwind classes with clsx
// clsx is a utility for conditionally joining class names together
// twMerge is a utility for merging tailwind classes together
export function cn(...inputs: ClassValue[]) {
  // return the merged tailwind classes
  return twMerge(clsx(inputs));
}

interface ApplicationError extends Error {
  info: string;
  status: number;
}

// fetcher function to fetch data from the API
export const fetcher = async (url: string) => {

  // fetch data from the API
  const res = await fetch(url);


  // if the response is not ok, throw an error
  if (!res.ok) {

    // create a new error
    const error = new Error(
      "An error occurred while fetching the data.",
    ) as ApplicationError;

  // assign the error info to the response json
    error.info = await res.json(); // assign the error info to the response json
    error.status = res.status; // assign the error status to the response status

    throw error;
  }

  // return the response json
  return res.json();
};


// getLocalStorage function to get data from the local storage
export function getLocalStorage(key: string) {

  // if the window object is not undefined, parse the local storage item
  if (typeof window !== "undefined") {

    // return the parsed local storage item
    return JSON.parse(localStorage.getItem(key) || "[]");
  }

  // return an empty array if the window object is undefined
  return [];
}

//generateUUID function to generate a unique identifier
//using the Math.random() function we generate a random number
// and convert it to a string
export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {

    // generate a random number * 16 and convert it to an integer
    const r = (Math.random() * 16) | 0;
    // if the character is x, return the random number
    // if the character is y, return the random number AND 0x3 OR 0x8
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    // return the random number as a string
    return v.toString(16); //16 is the radix
  });
}

// addToolMessageToChat function to add a tool message to the chat
function addToolMessageToChat({
  toolMessage,
  messages,
}: {
  toolMessage: CoreToolMessage;
  messages: Array<Message>;
}): Array<Message> {
  return messages.map((message) => {
    if (message.toolInvocations) {
      return {
        ...message,
        toolInvocations: message.toolInvocations.map((toolInvocation) => {
          const toolResult = toolMessage.content.find(
            (tool) => tool.toolCallId === toolInvocation.toolCallId,
          );

          if (toolResult) {
            return {
              ...toolInvocation,
              state: "result",
              result: toolResult.result,
            };
          }

          return toolInvocation;
        }),
      };
    }

    return message;
  });
}

export function convertToUIMessages(
  messages: Array<CoreMessage>,
): Array<Message> {
  return messages.reduce((chatMessages: Array<Message>, message) => {
    if (message.role === "tool") {
      return addToolMessageToChat({
        toolMessage: message as CoreToolMessage,
        messages: chatMessages,
      });
    }

    let textContent = "";
    let toolInvocations: Array<ToolInvocation> = [];

    if (typeof message.content === "string") {
      textContent = message.content;
    } else if (Array.isArray(message.content)) {
      for (const content of message.content) {
        if (content.type === "text") {
          textContent += content.text;
        } else if (content.type === "tool-call") {
          toolInvocations.push({
            state: "call",
            toolCallId: content.toolCallId,
            toolName: content.toolName,
            args: content.args,
          });
        }
      }
    }

    chatMessages.push({
      id: generateId(),
      role: message.role,
      content: textContent,
      toolInvocations,
    });

    return chatMessages;
  }, []);
}

export function getTitleFromChat(chat: Chat) {
  const messages = convertToUIMessages(chat.messages as Array<CoreMessage>);
  const firstMessage = messages[0];

  if (!firstMessage) {
    return "Untitled";
  }

  return firstMessage.content;
}
