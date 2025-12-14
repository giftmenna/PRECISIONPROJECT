import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import * as bcrypt from "bcryptjs";
import { prisma } from "./prisma";

// Validate required environment variables
if (!process.env.NEXTAUTH_SECRET) {
  console.error("❌ NEXTAUTH_SECRET is not set! Sessions will fail.");
  console.error("Run: openssl rand -base64 32");
  console.error("Then add NEXTAUTH_SECRET to your .env file");
}

if (!process.env.NEXTAUTH_URL && process.env.NODE_ENV === "production") {
  console.error("❌ NEXTAUTH_URL is not set for production!");
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.toLowerCase();

        // Check for hardcoded admin user
        if (email === "admin@precisionaw.com" && credentials.password === "admin123") {
          return {
            id: "admin",
            email: "admin@precisionaw.com",
            name: "Admin",
            role: "admin"
          };
        }

        // Check regular users
        const user = await prisma.user.findUnique({
          where: { email }
        });

        if (!user || !user.emailVerified) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: (user as any).role?.toUpperCase() || "USER",
          image: user.avatar || null,
          emailVerified: user.emailVerified
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role?.toUpperCase() || "USER";
        token.image = (user as any).image || null;
        token.emailVerified = (user as any).emailVerified || false;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).image = token.image || null;
        (session.user as any).emailVerified = token.emailVerified || false;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/login"
  }
}; 