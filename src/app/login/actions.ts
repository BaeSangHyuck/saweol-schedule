"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const pw = String(formData.get("password") ?? "");
  if (pw !== process.env.APP_PASSWORD) {
    redirect("/login?error=1");
  }
  cookies().set("auth", process.env.AUTH_COOKIE_SECRET!, {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/");
}
