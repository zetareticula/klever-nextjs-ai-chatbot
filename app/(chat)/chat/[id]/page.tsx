import { CoreMessage } from "ai";
import { notFound } from "next/navigation";
import { getSession } from "next-auth/react";
import { Chat as PreviewChat } from "@/components/custom/chat";
import { getChatById } from "@/db/queries";
import { Chat } from "@/db/schema";
import { convertToUIMessages } from "@/lib/utils";


// Compare this snippet from app/%28chat%29/chat/%5Bid%5D/page.tsx:
// import { Chat } from "@/db/schema";
// import { convertToUIMessages } from "@/lib/utils";
// import { getChatById } from "@/db/queries";
// import { Chat as PreviewChat } from "@/components/custom/chat";
// import { getSession } from "next-auth/react";
// import { notFound } from "next/navigation";
//
// // This page is responsible for rendering the chat preview page

// This page is responsible for rendering the chat preview page
export default async function Page({ params }: { params: any }) {
  // Get the chat ID from the URL
  const { id } = params;
  // Get the chat from the database
  const chatFromDb = await getChatById({ id });
// If the chat does not exist, return a 404 response
  if (!chatFromDb) {
    // return a 404 response
    notFound();
  }

  // type casting
  const chat: Chat = {
    ...chatFromDb,
    messages: convertToUIMessages(chatFromDb.messages as Array<CoreMessage>),
  };

  // Check if the user is authenticated by getting the session
  // If the user is not authenticated, return a 404 response
  const session = await getSession(); 

  if (!session || !session.user) {
    return notFound();
  }

  if (session.user.id !== chat.userId) {
    return notFound();
  }

  return <PreviewChat id={chat.id} initialMessages={chat.messages} />;
}
