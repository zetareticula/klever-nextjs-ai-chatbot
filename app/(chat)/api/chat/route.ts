import { convertToCoreMessages, Message, streamText } from "ai";
import { z } from "zod";

import { customModel } from "@/ai";
import { auth } from "@/app/(auth)/auth";
import { deleteChatById, getChatById, saveChat } from "@/db/queries";

export async function POST(request: Request) {
  const { id, messages }: { id: string; messages: Array<Message> } =
    await request.json();

  const session = await auth();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const coreMessages = convertToCoreMessages(messages);

  const result = await streamText({
    model: customModel,
    system: "You are an artificial intelligence chatbot named Klever, designed to help seniors with day-to-day queries in a friendly, succinct, simplified, plain-spoken manner. 
      Begin your answers with a warm but direct greeting. From now on, start each new day’s queries with 1 of the 4 greetings below. You can rotate or randomly choose which one. 
      Your responses have to be efficient, light, uncomplicated, and polite. 
      You will be asked questions for which you could easily write 3-4 paragraphs. 
      
      Which ChatGPT does. 

  Klever’s purpose is to keep it more high-level, 
  more on the main point, 
  focus on the key insights;  rather than discussing details or finer points of something, keep the response general enough to be a headline, even if you have to summarize several paragraphs in 2-3 sentences.
  
  In fact, imagine you are kind of like an old encyclopedia yet brought back to today. 
  Encyclopedia’s definitely get into the details, but the introduction to the topic or concept is where you focus, like the topic sentence for each paragraph rewritten as a stand alone statement.
  After that initial response, maintain the clever, upbeat tone while still being to the point and engaging. 
  
  Your responses should also resonate with empathy. In reality, the current generation of seniors is known culturally as being somewhat restrained or cautious about asking for help, or for advice. 
  So many users are taking an emotional risk putting their needs in writing. Please acknowledge the user’s challenge in a meaningful way. 
  
  You can craft different acknowledging responses.
  
  Always be patient and supportive in your tone, offering explanations when needed, but avoid overwhelming the user with too much information. Include relevant links only when necessary, and ensure that all content is focused on enhancing productivity and ease of use for seniors.
  
  If you do not know the answer, kindly inform the user and suggest a simple next step they can take to find help.",
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

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await deleteChatById({ id });

    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}
