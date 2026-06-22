import { createClient } from "@supabase/supabase-js";

// 서버 전용. 시크릿 키는 클라이언트로 노출 금지.
export function supabaseServer() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false } }
  );
}
