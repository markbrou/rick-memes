"use client";

import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { MemeItem } from "@/data/memes";
import Media from "./Media";
import PostDetails from "./PostDetails";

type Props = {
  items: MemeItem[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
};

const navButton =
  "fixed top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-2xl text-white hover:bg-white/25 md:top-1/2 md:h-12 md:w-12 md:-translate-y-1/2";

export default function Viewer({ items, index, onIndexChange, onClose }: Props) {
  const current = items[index];
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const step = useCallback(
    (delta: number) => onIndexChange((index + delta + items.length) % items.length),
    [index, items.length, onIndexChange],
  );

  function handleTouchStart(event: React.TouchEvent<HTMLElement>) {
    if (event.touches.length !== 1 || items.length < 2) {
      touchStart.current = null;
      return;
    }

    const target = event.target;
    if (!(target instanceof Element) || target.closest("figcaption, button, input, textarea, select")) {
      touchStart.current = null;
      return;
    }

    const touch = event.touches[0];
    if (
      target instanceof HTMLVideoElement &&
      touch.clientY >= target.getBoundingClientRect().bottom - 56
    ) {
      touchStart.current = null;
      return;
    }

    touchStart.current = { x: touch.clientX, y: touch.clientY };
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLElement>) {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || event.changedTouches.length !== 1) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (Math.abs(deltaX) < 60 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) return;

    step(deltaX < 0 ? 1 : -1);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, step]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={current.title}
      onClick={onClose}
      className="fixed inset-0 z-50 flex flex-col bg-merle-dark/95 px-3 pb-3 pt-16 backdrop-blur-sm md:p-4"
    >
      <button
        onClick={onClose}
        aria-label="Sluiten"
        className="fixed right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-xl text-white hover:bg-white/25 md:right-4 md:top-4"
      >
        ✕
      </button>
      {items.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); step(-1); }}
            aria-label="Vorige"
            className={`${navButton} left-3 md:left-4`}
          >
            ‹
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); step(1); }}
            aria-label="Volgende"
            className={`${navButton} left-16 md:left-auto md:right-4`}
          >
            ›
          </button>
        </>
      )}

      <figure
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={() => { touchStart.current = null; }}
        className="relative flex min-h-0 w-full flex-1 touch-pan-y flex-col overflow-hidden rounded-2xl bg-black shadow-2xl md:m-auto md:max-h-[90vh] md:max-w-5xl md:flex-none md:flex-row md:bg-white"
      >
        <Media item={current} />
        <PostDetails key={current.id} item={current} position={`${index + 1} / ${items.length}`} />
      </figure>
    </div>,
    document.body,
  );
}
