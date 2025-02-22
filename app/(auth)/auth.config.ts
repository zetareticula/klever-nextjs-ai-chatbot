import { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

// Define protected routes that require authentication
const protectedRoutes = ["/"];
// Define auth routes that should redirect to home if already logged in
const authRoutes = ["/login", "/register"];

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    newUser: "/register", // Changed from "/" to "/register" to match our auth.ts
    error: "/login", // Add error page
  },
  providers: [], // Empty array as providers are added in auth.ts
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      // Helper function to check if path starts with any of the routes
      const pathStartsWith = (routes: string[]) => 
        routes.some(route => pathname.startsWith(route));

      // Check if current path is a protected or auth route
      const isProtectedRoute = pathStartsWith(protectedRoutes);
      const isAuthRoute = pathStartsWith(authRoutes);

      try {
        // Redirect authenticated users trying to access auth pages to home
        if (isLoggedIn && isAuthRoute) {
          return NextResponse.redirect(new URL("/", nextUrl));
        }

        // Allow access to auth routes
        if (isAuthRoute) {
          return true;
        }

        // Protected routes require authentication
        if (isProtectedRoute) {
          return isLoggedIn;
        }

        // Redirect authenticated users to home if accessing unknown routes
        if (isLoggedIn) {
          return NextResponse.redirect(new URL("/", nextUrl));
        }

        // Allow access to all other routes
        return true;
      } catch (error) {
        console.error("Authorization error:", error);
        // Redirect to login page on error
        return NextResponse.redirect(new URL("/login", nextUrl));
      }
    },
    // Add JWT and Session callback types (these will be implemented in auth.ts)
    jwt: async ({ token, user }) => {
      return token;
    },
    session: async ({ session, token }) => {
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

// Export config types
export type AuthConfig = typeof authConfig;

