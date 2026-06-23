export type Role = "master" | "guest";

export const AUTH_COOKIE = "auth";

const SEP = ".";

// 쿠키 값 = `${role}.${secret}` 형태로 저장 (secret으로 위조 방지)
export function encodeSession(role: Role, secret: string): string {
  return `${role}${SEP}${secret}`;
}

export function parseSession(value: string | undefined, secret: string): Role | null {
  if (!value || !secret) return null;
  const idx = value.indexOf(SEP);
  if (idx === -1) return null;
  const role = value.slice(0, idx);
  const token = value.slice(idx + 1);
  if (token !== secret) return null;
  if (role === "master" || role === "guest") return role;
  return null;
}
