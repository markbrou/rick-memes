"use client";

import { useState } from "react";
import { usePostContext } from "./post/PostProvider";

type Props = {
  memeId: string;
  author: string;
  likeCount: number;
  liked: boolean;
};

export default function LikeButton({ memeId, author, likeCount, liked }: Props) {
  const { refreshFeed, showToast } = usePostContext();
  const [pending, setPending] = useState(false);
  const [currentLiked, setCurrentLiked] = useState(liked);
  const [currentCount, setCurrentCount] = useState(likeCount);
  const hasAuthor = Boolean(author.trim());

  async function toggleLike() {
    if (!hasAuthor || pending) return;
    setPending(true);
    try {
      const response = await fetch(`/api/memes/${encodeURIComponent(memeId)}/likes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error ?? "Like opslaan is niet gelukt");

      setCurrentLiked(Boolean(result.liked));
      setCurrentCount(Number(result.likeCount) || 0);
      refreshFeed();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Like opslaan is niet gelukt");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggleLike}
      disabled={!hasAuthor || pending}
      aria-label={`${currentLiked ? "Like verwijderen" : "Like geven"} (${currentCount})`}
      aria-pressed={currentLiked}
      title={hasAuthor ? (currentLiked ? "Like verwijderen" : "Like geven") : "Plaats eerst een meme of reactie met je naam om te liken"}
      className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm transition hover:bg-cream-dark disabled:cursor-not-allowed disabled:opacity-50"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={`h-5 w-5 ${currentLiked ? "fill-red-600 text-red-600" : "fill-none text-merle"}`}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>({currentCount})</span>
    </button>
  );
}