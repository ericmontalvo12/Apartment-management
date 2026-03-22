import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

/**
 * NextAuth configuration
 *
 * Role-based access control (RBAC) is enforced at the session level.
 * Each route/action should check session.user.role before allowing access.
 *
 * Roles:
 *   ADMIN          — full platform control
 *   PROJECT_MANAGER — manage buildings, units, updates
 *   SUBCONTRACTOR  — view own assigned work
 *   VIEWER         — read-only dashboard access
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  providers: [
    // NOTE: Configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),

    // Credentials provider for dev/demo login
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // TODO: Implement proper password hashing (bcrypt) for production
        // This is a placeholder for the demo seed user
        if (!credentials?.email) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        // PLACEHOLDER: In production, verify hashed password here
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          workspaceId: user.workspaceId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Attach custom fields to JWT
        token.role = (user as any).role;
        token.workspaceId = (user as any).workspaceId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).workspaceId = token.workspaceId;
      }
      return session;
    },
  },
};

// ─── Role permission helpers ──────────────────────────────────────────────────
// Use these throughout server actions and API routes

export type AppRole = "ADMIN" | "PROJECT_MANAGER" | "SUBCONTRACTOR" | "VIEWER";

export function canManageBuildings(role: AppRole): boolean {
  return role === "ADMIN" || role === "PROJECT_MANAGER";
}

export function canCreateUpdates(role: AppRole): boolean {
  return role !== "VIEWER";
}

export function canManageUsers(role: AppRole): boolean {
  return role === "ADMIN";
}

export function canViewWorkQueue(role: AppRole): boolean {
  return true; // All roles can view; subcontractors see filtered view
}
