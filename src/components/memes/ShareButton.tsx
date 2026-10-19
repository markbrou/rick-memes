"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";
import { usePostContext } from "./post/PostProvider";

export default function ShareButton({ memeId, title }: { memeId: string; title: string }) {
  const { baseUrl, showToast } = usePostContext();
  const [pending, setPending] = useState(false);

  async function share() {
    setPending(true);
    try {
      const url = new URL(baseUrl);
      if (!["http:", "https:"].includes(url.protocol)) throw new Error("Ongeldige website-URL");
      url.search = "";
      url.hash = "";
      url.searchParams.set("meme", memeId);
      if (navigator.share) {
        await navigator.share({ title, url: url.toString() });
      } else {
        await navigator.clipboard.writeText(url.toString());
        showToast("Link gekopieerd!");
      }
    } catch (error) {
      if (!(error instanceof Error && error.name === "AbortError")) {
        showToast("Delen is niet gelukt. Probeer het opnieuw.");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      disabled={pending}
      aria-label={`Deel ${title}`}
      title="Meme delen"
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-merle transition hover:bg-cream-dark hover:text-accent disabled:opacity-50"
    >
      <Share2 size={20} aria-hidden="true" />
    </button>
  );
}