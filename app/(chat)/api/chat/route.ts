import { convertToCoreMessages, Message, streamText } from "ai";
import { z } from "zod";

import { customModel } from "@/ai";
import { auth } from "@/app/(auth)/auth";
import { deleteChatById, getChatById, saveChat } from "@/db/queries";
import { getSession } from "next-auth/react";
import { GetSessionParams } from "next-auth/react";

// This route is responsible for handling the POST request to the chat API.
export async function POST(request: Request) {
  //The request body contains the chat ID and messages
  const { id, messages }: { id: string; messages: Array<Message> } =
      await request.json();

    // Check if the user is authenticated
    const session = await getSession({ request } as GetSessionParams);
    
    // If the user is not authenticated, return an unauthorized response
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    // If the user is authenticated, get the chat from the database
    const coreMessages = convertToCoreMessages(messages); //assign the messages to coreMessages

  // Get the chat from the database
  const result = await streamText({
    model: customModel, ///assign the customModel to the model
    system: "You are an artificial intelligence chatbot named Klever, designed to help seniors with day-to-day queries in a friendly and simplified manner. Your responses should be concise and focused on the main points, summarizing information in a clear and engaging way. Please acknowledge the user's challenges and provide patient and supportive responses. Avoid overwhelming the user with excessive information and only include relevant links when necessary. If you don't know the answer, kindly inform the user and suggest a simple next step they can take to find help.",
    messages: coreMessages,
    maxSteps: 5,
    tools: {
      getWeather: {
        description: "Get the current weather at a location",
        parameters: z.object({
          latitude: z.number(),
          longitude: z.number(),
        }),
        execute: async ({ latitude, longitude }) => {
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`,
          );

          const weatherData = await response.json();
          return weatherData;
        },
      },
    },
    onFinish: async ({ responseMessages }) => {
      if (session.user && session.user.id) {
        try {
          await saveChat({
            id,
            messages: [...coreMessages, ...responseMessages],
            userId: session.user.id,
          });
        } catch (error) {
          console.error("Failed to save chat");
        }
      }
    },
    experimental_telemetry: {
      isEnabled: true,
      functionId: "stream-text",
    },
  });

  return result.toDataStreamResponse({});
}
