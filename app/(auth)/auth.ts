import { compare } from "bcrypt-ts";
import NextAuth, { User, Session } from "next-auth";
import NextAuthOptions from "next-auth";
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

const authOptions = {
  ...authConfig,
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<ExtendedUser | null> {
        try {
          if (!credentials) {
            throw new Error("Missing credentials");
          }

          const { email, password } = credentials as Credentials;
          if (!email || !password) {
            throw new Error("Missing email or password");
          }

          const users = await getUser(email);
          if (users.length === 0) {
            return null;
          }

          const user = users[0];
          if (!user.password) {
            throw new Error("Invalid user data");
          }

          const passwordsMatch = await compare(password, user.password);
          if (!passwordsMatch) {
            return null;
          }

          const { password: _, ...userWithoutPassword } = user;
          return userWithoutPassword as ExtendedUser;
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
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
    strategy: "jwt" as const,
  },
  debug: process.env.NODE_ENV === "development",
};

const authInstance = NextAuth(authOptions);

export const GET = authInstance.handlers.GET;
export const POST = authInstance.handlers.POST;
export { authInstance as auth };
export type { ExtendedUser, ExtendedSession, Credentials };
