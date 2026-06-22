import type { Show } from "@/lib/types";

export function ShowCard({ show, onEdit }: { show: Show; onEdit: () => void }) {
  return (
    <button onClick={onEdit} className="overflow-hidden rounded-xl border border-border bg-white text-left">
      <div className="h-1.5" style={{ background: show.color }} />
      <div className="p-3">
        <h4 className="text-sm font-bold">{show.title}</h4>
        <div className="mt-2 space-y-1 text-[11px] text-muted-foreground">
          <div>정원 <b className="text-foreground">{show.capacity ? `${show.capacity}명` : "무제한"}</b></div>
          <div>기본 플레이타임 <b className="text-foreground">{show.default_play_minutes ? `${show.default_play_minutes}분` : "자유"}</b></div>
          {show.resource_link && <div>📎 자료링크</div>}
        </div>
      </div>
    </button>
  );
}
