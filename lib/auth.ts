import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

/**
 * Get the current session on the server. Returns null if not authenticated.
 * Use this in Server Components and API routes to enforce user isolation.
 */
export async function getSession() {
  return getServerSession(authOptions);
}

/**
 * Require a session; throws if not authenticated.
 * Returns the session for type-safe access to user.id.
 */
export async function requireSession() {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session;
}
