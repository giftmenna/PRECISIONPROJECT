import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions";
import { prisma } from "./prisma";

/**
 * Checks if the current session belongs to an admin user
 * Handles both hardcoded admin and database users with admin role
 * @returns true if user is admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return false;
  }

  // Check for hardcoded admin user
  if (session.user.email === "admin@precisionaw.com") {
    return true;
  }

  // Check database users
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  return user?.role?.toUpperCase() === "ADMIN";
}

/**
 * Gets the current session or throws an error
 * Use this when you need the session and want to fail fast if not authenticated
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }
  
  return session;
}

/**
 * Requires admin access or throws an error
 * Use this at the start of admin API routes
 */
export async function requireAdmin() {
  const session = await requireAuth();
  const adminStatus = await isAdmin();
  
  if (!adminStatus) {
    throw new Error("Admin access required");
  }
  
  return session;
}
