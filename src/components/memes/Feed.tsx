"use client";

import { useEffect, useRef, useState } from "react";
import type { MemeItem } from "@/data/memes";
import { prioritizeRecentMemes } from "@/lib/memeRecency";
import FilterBar, { type Filter, type SortOrder } from "./FilterBar";
import Grid from "./Grid";
import { usePostContext } from "./post/PostProvider";
import Viewer from "./viewer/Viewer";

export default function Feed({ sharedMemeId }: { sharedMemeId?: string }) {
  const { revision, adminMode, showToast, disableAdminMode, setMemeCount } = usePostContext();
  const [items, setItems] = useState<MemeItem[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [filter, setFilter] = useState<Filter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("random");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const displayOrder = useRef<string[] | null>(null);
  const handledSharedMeme = useRef<string | null>(null);
  const [sharedMemeMissing, setSharedMemeMissing] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadMemes() {
      try {
        const response = await fetch("/api/memes", { signal: controller.signal });
        if (!response.ok) throw new Error(`Verzoek mislukt (${response.status})`);

        const data: unknown = await response.json();
        if (!Array.isArray(data)) throw new Error("Ongeldig antwoord ontvangen");

        const incoming = data as MemeItem[];
        const shuffled = displayOrder.current === null
          ? shuffleMemes(incoming)
          : preserveDisplayOrder(incoming, displayOrder.current);
        const ordered = prioritizeRecentMemes(shuffled);
        displayOrder.current = ordered.map((item) => item.id);
        setItems(ordered);
        setMemeCount(ordered.length);
        if (sharedMemeId && handledSharedMeme.current !== sharedMemeId) {
          handledSharedMeme.current = sharedMemeId;
          const sharedIndex = ordered.findIndex((item) => item.id === sharedMemeId);
          setSharedMemeMissing(sharedIndex < 0);
          if (sharedIndex >= 0) setOpenIndex(sharedIndex);
        }
        setStatus("ready");
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setStatus("error");
        }
      }
    }

    loadMemes();
    return () => controller.abort();
  }, [revision, sharedMemeId, setMemeCount]);

  const visible = filter === "all" ? [...items] : items.filter((i) => i.type === filter);
  if (sortOrder !== "random") {
    visible.sort((first, second) => sortOrder === "newest"
      ? second.postedAt.localeCompare(first.postedAt)
      : first.postedAt.localeCompare(second.postedAt));
  }

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
      setMemeCount(items.length - 1);
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
      {sharedMemeMissing && (
        <p role="status" className="mb-6 text-center text-merle">Deze gedeelde meme is niet meer beschikbaar.</p>
      )}
      <FilterBar
        value={filter}
        onChange={(value) => { setOpenIndex(null); setFilter(value); }}
        sortOrder={sortOrder}
        onSortChange={(value) => { setOpenIndex(null); setSortOrder(value); }}
      />
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

function shuffleMemes(items: MemeItem[]) {
  const shuffled = [...items];
  for (let position = shuffled.length - 1; position > 0; position--) {
    const swapWith = Math.floor(Math.random() * (position + 1));
    [shuffled[position], shuffled[swapWith]] = [shuffled[swapWith], shuffled[position]];
  }
  return shuffled;
}

function preserveDisplayOrder(items: MemeItem[], order: string[]) {
  const itemsById = new Map(items.map((item) => [item.id, item]));
  const knownIds = new Set(order);
  const existing = order.flatMap((id) => {
    const item = itemsById.get(id);
    return item ? [item] : [];
  });
  const newlyAdded = items.filter((item) => !knownIds.has(item.id));
  return [...existing, ...newlyAdded];
}
