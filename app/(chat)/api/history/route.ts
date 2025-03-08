import getServerSession, { NextAuthResult } from "next-auth";
import { getSession } from 'next-auth/react';
import { authOptions } from "@/app/(auth)/auth"; // Import authOptions from the auth module
import { deleteChatById, getChatsByUserId, saveChat } from "@/db/queries"; // Import the database queries
import { NextApiRequest, NextApiResponse } from "next";
import { Response } from "node-fetch";
import { GetSessionParams } from 'next-auth/react';
import { customModel } from "@/ai";
import { streamText } from "ai";
import { z } from "zod";

// This file contains the API routes for the chat history feature.
// The routes are responsible for handling the POST, GET, and DELETE requests to the history API.

// This route is responsible for handling the POST request to the history API.
export async function POST(request: NextApiRequest, response: NextApiResponse) {

  // Check if the user is authenticated
  const session = await getSession({ request } as GetSessionParams);
  
  // If the user is not authenticated, return an unauthorized response
  if (!session) {
    return response.status(401).send("Unauthorized");
  }

  // Get the chat ID and messages from the request body
  const { id, messages } = await request.body;

  // Get the chat from the database
  const result = await streamText({
    model: customModel,
    system: "You are an artificial intelligence chatbot named Klever, designed to help seniors with day-to-day queries in a friendly and simplified manner. Your responses should be concise and focused on the main points, summarizing information in a clear and engaging way. Please acknowledge the user's challenges and provide patient and supportive responses. Avoid overwhelming the user with excessive information and only include relevant links when necessary. If you don't know the answer, kindly inform the user and suggest a simple next step they can take to find help.",
    messages: messages,
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
            messages: [...messages, ...responseMessages],
            userId: session.user.id,
          });
        } catch (error) {
          console.error("Failed to save chat");
        }
      }
    },
  });

  return response.status(200).json(result);
}



// This route is responsible for handling the GET request to the history API.
export async function GET() {
  const session: NextAuthResult | null = await getServerSession(authOptions);

  if (!session || !('user' in session) || !session.user) {
    return new Response("Unauthorized!", { status: 401 });
  }

  const chats = await getChatsByUserId({ id: (session.user as { id: string }).id });
  return new Response(JSON.stringify(chats));
}

// This route is responsible for handling the DELETE request to the history API.
export async function DELETE(request: NextApiRequest, response: NextApiResponse) {
  const session = await getSession({ request } as GetSessionParams);

  if (!session) {
    return response.status(401).send("Unauthorized");
  }

  const { id } = await request.body;
  await deleteChatById({ id });

  return response.status(200).send("Chat deleted successfully");
}