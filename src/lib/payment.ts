// 결제상태 선택지 및 표시 스타일. 차액결제(추가결제 필요)는 빨강 강조.
export const PAYMENT_STATUSES = ["전액결제", "차액결제"] as const;

export function paymentBadge(status: string | null): { label: string; cls: string } | null {
  if (status === "차액결제") return { label: "차액결제", cls: "text-red-700 font-bold" };
  if (status === "전액결제") return { label: "전액결제", cls: "text-gray-500" };
  return null; // 미정 = 표시 안 함
}
