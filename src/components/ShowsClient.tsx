"use client";
import { useState } from "react";
import type { Show } from "@/lib/types";
import { ShowCard } from "./ShowCard";
import { ShowForm } from "./ShowForm";

export function ShowsClient({ shows }: { shows: Show[] }) {
  const [editing, setEditing] = useState<Show | null | "new">(null);
  return (
    <>
      <div className="mb-4 flex justify-end">
        <button onClick={() => setEditing("new")} className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">+ 공연 추가</button>
      </div>
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))" }}>
        {shows.map((s) => <ShowCard key={s.id} show={s} onEdit={() => setEditing(s)} />)}
      </div>
      {editing !== null && (
        <ShowForm show={editing === "new" ? null : editing} onClose={() => setEditing(null)} />
      )}
    </>
  );
}
