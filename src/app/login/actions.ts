"use server";
import { cookies } from "next/headers";
import { AUTH_COOKIE, encodeSession, type Role } from "@/lib/session";

type Result = { ok: true; role: Role } | { ok: false };

export async function login(password: string): Promise<Result> {
  let role: Role | null = null;
  if (password === process.env.MASTER_PASSWORD) role = "master";
  else if (password === process.env.GUEST_PASSWORD) role = "guest";
  if (!role) return { ok: false };

  cookies().set(AUTH_COOKIE, encodeSession(role, process.env.AUTH_COOKIE_SECRET!), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return { ok: true, role };
}
