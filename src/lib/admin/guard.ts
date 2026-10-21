import "server-only";
import { auth } from "@/auth";

// Every admin read and write goes through this, the UI hiding a button is never the check
export async function ownerSession() {
  const session = await auth();
  return session?.user.owner ? session : null;
}

export async function requireOwner() {
  const session = await ownerSession();
  if (!session) throw new Error("Forbidden");
  return session;
}
