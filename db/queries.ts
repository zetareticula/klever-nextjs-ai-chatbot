"server-only";

import { genSaltSync, hashSync } from "bcrypt-ts";
import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { user, chat, User } from "./schema";

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle
let client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`);
let db = drizzle(client);

//get all users through email: string which is unique, so it will return only one user
//if there are multiple users with the same email, it will return the first one
//promise is used to handle async operations
export async function getUser(email: string): Promise<Array<User>> {
  //try block is used to handle exceptions
  try {
    //await is used to wait for the promise to be resolved; 
    //db.select() is used to select the data from the database
    //from(user) is used to select the data from the user table
    //where(eq(user.email, email)) is used to select the data where the email is equal to the email passed as an argument
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    console.error("Failed to get user from database");
    throw error;
  }
}

//create a new user with email and password
export async function createUser(email: string, password: string) {
  //genSaltSync(10) is used to generate a salt with 10 rounds
  let salt = genSaltSync(10);
  //hashSync(password, salt) is used to hash the password with the salt 
  let hash = hashSync(password, salt);

  try {
    //db.insert(user) is used to insert the data into the user table
    //values({ email, password: hash }) is used to insert the email and hashed password into the user table
    return await db.insert(user).values({ email, password: hash });
  } catch (error) {
    console.error("Failed to create user in database");
    throw error;
  }
}

//save chat with id, messages and userId
export async function saveChat({
  id,
  messages,
  userId,
}: {
  id: string;
  messages: any;
  userId: string;
}) {
  try {
    //db.select().from(chat).where(eq(chat.id, id)) is used to select the chat from the chat table where the id is equal to the id passed as an argument
    const selectedChats = await db.select().from(chat).where(eq(chat.id, id));

    //if the selectedChats length is greater than 0, then update the chat
    if (selectedChats.length > 0) {
      //db.update(chat) is used to update the chat in the chat table
      //set({ messages: JSON.stringify(messages) }) is used to set the messages in the chat table
      return await db
        .update(chat)
        .set({
          messages: JSON.stringify(messages),
        })
        .where(eq(chat.id, id));
    }

    //if the selectedChats length is not greater than 0, then insert the chat
    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      messages: JSON.stringify(messages),
      userId,
    });
  } catch (error) {
    console.error("Failed to save chat in database");
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    return await db.delete(chat).where(eq(chat.id, id));
  } catch (error) {
    console.error("Failed to delete chat by id from database");
    throw error;
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(chat)
      .where(eq(chat.userId, id))
      .orderBy(desc(chat.createdAt));
  } catch (error) {
    console.error("Failed to get chats by user from database");
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    console.error("Failed to get chat by id from database");
    throw error;
  }
}
