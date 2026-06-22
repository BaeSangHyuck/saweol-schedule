import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const auth = req.cookies.get("auth")?.value;
  if (auth !== process.env.AUTH_COOKIE_SECRET) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

// 캘린더(/)는 누구나 보기 가능. 공연Info·설정만 보호.
export const config = { matcher: ["/shows/:path*", "/settings/:path*"] };
