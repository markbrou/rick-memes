"use client";

import { useState } from "react";
import type { MemeItem } from "@/data/memes";
import { formatDate } from "@/lib/formatDate";
import Avatar from "../Avatar";
import CommentForm from "./CommentForm";
import Comments from "./Comments";
import CommentIcon from "../CommentIcon";

type Props = {
  item: MemeItem;
  position: string;
};

export default function PostDetails({ item, position }: Props) {
  const [bioOpen, setBioOpen] = useState(false);

  return (
    <figcaption className="relative shrink-0 bg-white text-merle-dark md:flex md:w-80 md:flex-col">
      <div className="relative z-10 flex min-h-24 items-center gap-3 border-b border-cream-dark bg-white px-4 py-4 md:min-h-0 md:py-3">
        <Avatar name={item.author} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{item.author}</p>
          <h2 className="whitespace-normal break-words text-base font-bold leading-snug [overflow-wrap:anywhere]">{item.title}</h2>
        </div>
        <span className="shrink-0 text-xs text-merle">{position}</span>
        <button
          onClick={() => setBioOpen((o) => !o)}
          aria-expanded={bioOpen}
          aria-controls="meme-bio"
          aria-label={bioOpen ? "Bijschrift en reacties verbergen" : "Bijschrift en reacties tonen"}
          className="flex h-9 shrink-0 items-center gap-1 rounded-full bg-cream-dark px-3 text-xs font-semibold text-merle-dark md:hidden"
        >
          <CommentIcon className="h-5 w-5" />
          {item.comments?.length ?? 0}
          <svg viewBox="0 0 20 20" fill="currentColor" className={`h-4 w-4 transition-transform ${bioOpen ? "rotate-180" : ""}`}>
            <path d="M5.23 12.79a.75.75 0 0 0 1.06.02L10 9.23l3.71 3.58a.75.75 0 1 0 1.04-1.08l-4.23-4.08a.75.75 0 0 0-1.04 0L5.25 11.73a.75.75 0 0 0-.02 1.06Z" />
          </svg>
        </button>
      </div>
      {/* Mobile: sheet that slides up over the media. Desktop: regular side panel. */}
      <div
        id="meme-bio"
        className={`absolute inset-x-0 bottom-full max-h-[55dvh] overflow-y-auto rounded-t-2xl bg-white/95 px-4 py-4 shadow-[0_-8px_24px_rgba(0,0,0,0.25)] backdrop-blur transition-all duration-300 md:visible md:pointer-events-auto md:static md:max-h-none md:flex-1 md:translate-y-0 md:rounded-none md:bg-white md:opacity-100 md:shadow-none ${
          bioOpen ? "visible translate-y-0 opacity-100" : "pointer-events-none invisible translate-y-full opacity-0"
        }`}
      >
        {item.bio && <p className="whitespace-pre-line text-sm leading-relaxed text-merle-dark [overflow-wrap:anywhere]">{item.bio}</p>}
        <time dateTime={item.postedAt} className="mt-4 block text-xs uppercase tracking-wide text-merle">
          {formatDate(item.postedAt, "long")}
        </time>
        <Comments comments={item.comments ?? []} />
        <CommentForm memeId={item.id} />
      </div>
    </figcaption>
  );
}
