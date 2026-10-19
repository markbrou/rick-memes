"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePostContext } from "@/components/memes/post/PostProvider";

export default function SiteHeader({ showPostAction }: { showPostAction: boolean }) {
  const { openPostForm } = usePostContext();
  const [showLogo, setShowLogo] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollFrame = useRef(0);

  function scrollToTop() {
    window.cancelAnimationFrame(scrollFrame.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo(0, 0);
      return;
    }

    const startY = window.scrollY;
    let startedAt: number | null = null;
    const animateScroll = (time: number) => {
      startedAt ??= time;
      const progress = Math.min((time - startedAt) / 600, 1);
      window.scrollTo(0, startY * Math.pow(1 - progress, 3));
      if (progress < 1) scrollFrame.current = window.requestAnimationFrame(animateScroll);
    };
    scrollFrame.current = window.requestAnimationFrame(animateScroll);
  }

  useEffect(() => () => window.cancelAnimationFrame(scrollFrame.current), []);

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 0);
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  useEffect(() => {
    const heroLogo = document.getElementById("hero-logo");
    if (!heroLogo) return;

    const observer = new IntersectionObserver(([entry]) => {
      setShowLogo(!entry.isIntersecting);
    });
    observer.observe(heroLogo);
    return () => observer.disconnect();
  }, []);

  return (
    <header className={`sticky top-0 z-40 border-b bg-cream/85 backdrop-blur transition-colors duration-200 ${isScrolled ? "border-accent/20" : "border-transparent"}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="RickMemes, terug naar boven"
          className="flex items-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4"
        >
          <span
            aria-hidden="true"
            className={`mr-0 inline-flex h-9 overflow-hidden transition-[width,opacity,margin] duration-300 ${showLogo ? "mr-2 w-9 opacity-100" : "w-0 opacity-0"}`}
          >
            <Image src="/rick.png" alt="" width={36} height={36} unoptimized className="h-9 w-9 max-w-none object-contain" />
          </span>
          <span className="text-xl font-black tracking-tight">
            Rick<span className="text-accent">Memes</span>
          </span>
        </button>
        <button
          onClick={openPostForm}
          disabled={!showPostAction}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold shadow-sm transition ${
            showPostAction
              ? "bg-accent text-on-accent hover:brightness-110"
              : "cursor-not-allowed bg-cream-dark text-merle"
          }`}
        >
          {showPostAction ? (
            <span aria-hidden="true" className="text-base leading-none">+</span>
          ) : (
            <LockIcon />
          )}
          <span>Meme plaatsen</span>
        </button>
      </div>
    </header>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4">
      <path fillRule="evenodd" d="M5 7V6a5 5 0 0 1 10 0v1a3 3 0 0 1 2 2.83v6.34A2.83 2.83 0 0 1 14.17 19H5.83A2.83 2.83 0 0 1 3 16.17V9.83A3 3 0 0 1 5 7Zm2 0h6V6a3 3 0 1 0-6 0v1Zm3 4a1.5 1.5 0 0 0-.75 2.8V15a.75.75 0 0 0 1.5 0v-1.2A1.5 1.5 0 0 0 10 11Z" clipRule="evenodd" />
    </svg>
  );
}
