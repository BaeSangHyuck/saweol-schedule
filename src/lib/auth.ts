import { cookies } from "next/headers";
import { AUTH_COOKIE, parseSession, type Role } from "./session";

export function getRole(): Role | null {
  return parseSession(cookies().get(AUTH_COOKIE)?.value, process.env.AUTH_COOKIE_SECRET ?? "");
}

export function isAdmin(): boolean {
  return getRole() === "master";
}

export function requireAdmin() {
  if (!isAdmin()) throw new Error("Unauthorized");
}
