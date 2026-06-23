import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE, parseSession } from "@/lib/session";

export function middleware(req: NextRequest) {
  const role = parseSession(req.cookies.get(AUTH_COOKIE)?.value, process.env.AUTH_COOKIE_SECRET ?? "");
  const { pathname } = req.nextUrl;

  // 로그인 안 됨 → 어느 주소든 로그인 페이지로
  if (!role) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  // 게스트는 캘린더만. 공연 Info·설정·GM 관리는 마스터 전용
  if (role === "guest" && (pathname.startsWith("/shows") || pathname.startsWith("/settings") || pathname.startsWith("/gm"))) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!login|api|_next/static|_next/image|favicon.ico).*)"],
};
