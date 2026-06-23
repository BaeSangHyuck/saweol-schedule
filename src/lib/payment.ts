// 결제상태 선택지 및 표시 스타일.
// 전액결제·차액결제는 빨강, 임직원은 파랑, 예약번호는 메모(번호)를 진하게 표시.
export const PAYMENT_STATUSES = ["전액결제", "차액결제", "임직원", "예약번호"] as const;

export function paymentBadge(status: string | null, memo?: string | null): { label: string; cls: string } | null {
  if (status === "전액결제") return { label: "전액결제", cls: "text-red-600 font-bold" };
  if (status === "차액결제") return { label: "차액결제", cls: "text-red-600 font-bold" };
  if (status === "임직원") return { label: "임직원", cls: "text-blue-700 font-bold" };
  if (status === "예약번호") return { label: memo && memo.trim() ? memo : "예약번호", cls: "text-gray-800 font-bold" };
  return null; // 미정 = 표시 안 함
}
