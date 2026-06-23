"use client";
import { useRouter } from "next/navigation";
import { logout } from "@/app/actions";
import { clearClientRole } from "@/lib/clientAuth";

export function LogoutButton() {
  const router = useRouter();
  async function onClick() {
    clearClientRole();
    await logout();
    router.replace("/login");
  }
  return (
    <button onClick={onClick} className="text-muted-foreground hover:text-foreground">
      로그아웃
    </button>
  );
}
