import { cookies } from "next/headers";

export function isAdmin(): boolean {
  return cookies().get("auth")?.value === process.env.AUTH_COOKIE_SECRET;
}

export function requireAdmin() {
  if (!isAdmin()) throw new Error("Unauthorized");
}
