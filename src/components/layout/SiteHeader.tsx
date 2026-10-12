"use client";

import { usePostContext } from "@/components/memes/post/PostProvider";

export default function SiteHeader() {
  const { openPostForm } = usePostContext();

  return (
    <header className="sticky top-0 z-40 border-b border-accent/20 bg-cream/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <span className="text-xl font-black tracking-tight">
          Rick<span className="text-accent">Memes</span>
        </span>
        <button
          onClick={openPostForm}
          className="rounded-full bg-accent px-4 py-2 text-sm font-bold text-on-accent shadow-sm transition hover:brightness-110"
        >
          + Meme plaatsen
        </button>
      </div>
    </header>
  );
}
