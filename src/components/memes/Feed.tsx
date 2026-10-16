"use client";

import { useEffect, useState } from "react";
import type { MemeItem } from "@/data/memes";
import FilterBar, { type Filter } from "./FilterBar";
import Grid from "./Grid";
import { usePostContext } from "./post/PostProvider";
import Viewer from "./viewer/Viewer";

export default function Feed() {
  const { revision, adminMode, showToast, disableAdminMode } = usePostContext();
  const [items, setItems] = useState<MemeItem[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [filter, setFilter] = useState<Filter>("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadMemes() {
      try {
        const response = await fetch("/api/memes", { signal: controller.signal });
        if (!response.ok) throw new Error(`Verzoek mislukt (${response.status})`);

        const data: unknown = await response.json();
        if (!Array.isArray(data)) throw new Error("Ongeldig antwoord ontvangen");

        setItems(data as MemeItem[]);
        setStatus("ready");
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setStatus("error");
        }
      }
    }

    loadMemes();
    return () => controller.abort();
  }, [revision]);

  const visible = filter === "all" ? items : items.filter((i) => i.type === filter);

  async function deleteMeme(item: MemeItem) {
    if (!window.confirm(`Weet je zeker dat je "${item.title}" wilt verwijderen? De reacties en geüploade media worden ook verwijderd.`)) return;
    setDeletingId(item.id);
    try {
      const response = await fetch(`/api/memes/${encodeURIComponent(item.id)}`, { method: "DELETE" });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        if (response.status === 403) await disableAdminMode();
        throw new Error(result?.error ?? "Bericht verwijderen is niet gelukt");
      }

      setOpenIndex(null);
      setItems((current) => current.filter((meme) => meme.id !== item.id));
      showToast("Bericht verwijderd");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Bericht verwijderen is niet gelukt");
    } finally {
      setDeletingId(null);
    }
  }

  if (status === "loading") {
    return <p id="memes" data-feed-status="loading" className="scroll-mt-20 py-16 text-center text-merle">Memes laden...</p>;
  }

  if (status === "error") {
    return <p id="memes" data-feed-status="error" className="scroll-mt-20 py-16 text-center text-merle">Memes laden is niet gelukt. Vernieuw de pagina.</p>;
  }

  return (
    <div id="memes" data-feed-status="ready" className="feed-reveal scroll-mt-20">
      <FilterBar value={filter} onChange={setFilter} />
      {visible.length > 0 ? (
        <Grid
          items={visible}
          onOpen={setOpenIndex}
          adminMode={adminMode}
          deletingId={deletingId}
          onDelete={deleteMeme}
        />
      ) : (
        <p className="py-16 text-center text-merle">Er staan nog geen berichten. Plaats als eerste een meme!</p>
      )}
      {openIndex !== null && (
        <Viewer
          items={visible}
          index={openIndex}
          onIndexChange={setOpenIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </div>
  );
}
