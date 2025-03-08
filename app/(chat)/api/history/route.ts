import { getSession } from 'next-auth/react';
import { auth } from "@/app/(auth)/auth";
import { getChatsByUserId } from "@/db/queries";



// This route is responsible for handling the GET request to the history API.
export async function GET() {
  // Check if the user is authenticated
  const session = await getSession(); // Get the session

  if (!session || !session.user) {
    return new Response("Unauthorized!", { status: 401 });
  }

  const chats = await getChatsByUserId({ id: session.user.id! });
  return new Response(JSON.stringify(chats));
}
