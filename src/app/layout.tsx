import "./globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata = { title: "사월점 스케줄" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <NuqsAdapter>
          <AuthProvider>{children}</AuthProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
