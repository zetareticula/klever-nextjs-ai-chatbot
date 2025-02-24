import { compare } from "bcrypt-ts";
import NextAuth, { User, Session, AuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

import { getUser } from "@/db/queries";

import { authConfig } from "./auth.config";

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
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }: { session: ExtendedSession; token: JWT }): Promise<ExtendedSession> {
      if (session.user) {
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

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authOptions);

export type { ExtendedUser, ExtendedSession, Credentials };