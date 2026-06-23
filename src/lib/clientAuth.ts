"use client";
import type { Role } from "./session";

export const ROLE_KEY = "saweol-role";

export function getClientRole(): Role | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(ROLE_KEY);
  return v === "master" || v === "guest" ? v : null;
}

export function setClientRole(role: Role) {
  window.localStorage.setItem(ROLE_KEY, role);
}

export function clearClientRole() {
  window.localStorage.removeItem(ROLE_KEY);
}
