import { compare } from "bcrypt-ts";
import NextAuth, { User, Session, AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";

import { getUser } from "@/db/queries";
import { authConfig } from "./auth.config";

// Extended types for better type safety
interface ExtendedUser extends User {
  id: string;
  email: string;
  password?: string;
}

interface ExtendedSession extends Session {
  user: ExtendedUser;
}

interface Credentials {
  email: string;
  password: string;
}

// Auth configuration with proper types
const authOptions: AuthOptions = {
  ...authConfig,
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: Credentials | undefined): Promise<ExtendedUser | null> {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Missing credentials");
          }

          const users = await getUser(credentials.email);
          
          if (users.length === 0) {
            return null;
          }

          const user = users[0];
          
          if (!user.password) {
            throw new Error("Invalid user data");
          }

          const passwordsMatch = await compare(credentials.password, user.password);

          if (!passwordsMatch) {
            return null;
          }

          // Return user without password
          const { password, ...userWithoutPassword } = user;
          return userWithoutPassword as ExtendedUser;
          
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: ExtendedUser }): Promise<JWT> {
      if (user) {
        // Add user info to token
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }: { session: ExtendedSession; token: JWT }): Promise<ExtendedSession> {
      if (session.user) {
        // Add user info from token to session
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
};

// Export auth handlers and helpers
export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authOptions);

// Export types for use in other files
export type { ExtendedUser, ExtendedSession, Credentials };