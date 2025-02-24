
import { NextResponse } from "next/server";

import { NextAuthConfig } from "next-auth";


const protectedRoutes = ["/"];
const authRoutes = ["/login", "/register"];

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    newUser: "/register",
    error: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      const pathStartsWith = (routes: string[]) => 
        routes.some(route => pathname.startsWith(route));

      const isProtectedRoute = pathStartsWith(protectedRoutes);
      const isAuthRoute = pathStartsWith(authRoutes);

      try {
        if (isLoggedIn && isAuthRoute) {
          return NextResponse.redirect(new URL("/", nextUrl));
        }

        if (isAuthRoute) {
          return true;
        }

        if (isProtectedRoute) {
          return isLoggedIn;
        }

        if (isLoggedIn) {
          return NextResponse.redirect(new URL("/", nextUrl));
        }

        return true;
      } catch (error) {
        console.error("Authorization error:", error);
        return NextResponse.redirect(new URL("/login", nextUrl));
      }
    },
    jwt: async ({ token, user }) => {
      return token;
    },
    session: async ({ session, token }) => {
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

export type AuthConfig = typeof authConfig;