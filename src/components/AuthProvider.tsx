"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getClientRole } from "@/lib/clientAuth";

const MASTER_ONLY = ["/shows", "/settings", "/gm"];

// localStorage 권한을 보고 클라이언트 게이트 처리.
// 권한 없으면 어느 주소든 /login, 게스트가 마스터 전용 경로 접근 시 /로 보냄.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [state, setState] = useState<"loading" | "ok" | "blocked">("loading");

  useEffect(() => {
    if (pathname === "/login") {
      setState("ok");
      return;
    }
    const role = getClientRole();
    if (!role) {
      setState("blocked");
      router.replace("/login");
      return;
    }
    if (role === "guest" && MASTER_ONLY.some((p) => pathname.startsWith(p))) {
      setState("blocked");
      router.replace("/");
      return;
    }
    setState("ok");
  }, [pathname, router]);

  if (state !== "ok") return null;
  return <>{children}</>;
}
