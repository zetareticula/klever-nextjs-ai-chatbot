import { auth } from "@/app/(auth)/auth";
import { getChatsByUserId } from "@/db/queries";

import { getSession } from 'next-auth/react';

export async function GET() {
  const session = await getSession();

  if (!session || !session.user) {
    return new Response("Unauthorized!", { status: 401 });
  }

  const chats = await getChatsByUserId({ id: session.user.id! });
  return new Response(JSON.stringify(chats));
}
