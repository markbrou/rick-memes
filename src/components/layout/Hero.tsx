"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AccessGate from "@/components/AccessGate";

type Props = {
  hasAccess: boolean;
  question: string;
};

export default function Hero({ hasAccess, question }: Props) {
  const router = useRouter();
  const hadAccess = useRef(hasAccess);
  const scrollFrame = useRef(0);
  const [accessDialogOpen, setAccessDialogOpen] = useState(false);
  const [skadiVisible, setSkadiVisible] = useState(false);

  const scrollToMemes = useCallback(() => {
    window.history.replaceState(null, "", "#memes");
    window.cancelAnimationFrame(scrollFrame.current);

    const duration = 600;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const startY = window.scrollY;
    let startedAt: number | null = null;

    const waitForFeed = () => {
      const feed = document.getElementById("memes");
      if (!feed || feed.dataset.feedStatus === "loading") {
        scrollFrame.current = window.requestAnimationFrame(waitForFeed);
        return;
      }

      const target = feed.querySelector<HTMLElement>("li") ?? feed;
      const headerHeight = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
      const endY = Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerHeight - 16);

      if (reduceMotion) {
        window.scrollTo(0, endY);
        return;
      }

      const animateScroll = (time: number) => {
        startedAt ??= time;
        const progress = Math.min((time - startedAt) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        window.scrollTo(0, startY + (endY - startY) * eased);
        if (progress < 1) scrollFrame.current = window.requestAnimationFrame(animateScroll);
      };

      scrollFrame.current = window.requestAnimationFrame(animateScroll);
    };

    scrollFrame.current = window.requestAnimationFrame(waitForFeed);
  }, []);

  useEffect(() => {
    if (!hasAccess || hadAccess.current) return;
    hadAccess.current = true;
    scrollToMemes();
  }, [hasAccess, router, scrollToMemes]);

  useEffect(() => () => window.cancelAnimationFrame(scrollFrame.current), []);

  return (
    <>
      <section className="flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center py-8 text-center">
        <div className="flex flex-col items-center">
          <div className="relative mb-5">
            {hasAccess && (
              <Image
                src="/skadi.png"
                alt=""
                aria-hidden="true"
                width={803}
                height={1005}
                unoptimized
                className={`pointer-events-none absolute bottom-0 right-full mr-2 h-24 w-auto transition duration-300 sm:h-28 md:h-32 ${
                  skadiVisible ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0"
                }`}
              />
            )}
            <button
              type="button"
              onClick={() => hasAccess ? setSkadiVisible((visible) => !visible) : setAccessDialogOpen(true)}
              aria-label={hasAccess ? (skadiVisible ? "Verberg Skadi" : "Toon Skadi") : "Ontgrendel om Skadi te zien"}
              aria-pressed={hasAccess ? skadiVisible : undefined}
              className="block rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4"
            >
              <Image
                id="hero-logo"
                src="/rick.png"
                alt=""
                width={632}
                height={951}
                priority
                unoptimized
                className="h-40 w-auto sm:h-56 md:h-64"
              />
            </button>
          </div>
          <h1 className="text-5xl font-black tracking-tight sm:text-6xl">
            Een ode aan <span className="text-accent">Rick.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-lg text-merle">
            De leukste, domste en grappigste momenten, uitspraken en blunders van onze favoriete wandelende meme. We love you, Ricky!
          </p>
          {hasAccess ? (
            <a
              href="#memes"
              onClick={(event) => {
                event.preventDefault();
                scrollToMemes();
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-accent/25 px-5 py-3 font-bold text-accent transition hover:bg-accent hover:text-on-accent"
            >
              Naar de memes!
              <ArrowDown />
            </a>
          ) : (
            <button
              type="button"
              onClick={() => setAccessDialogOpen(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 font-bold text-on-accent shadow-sm transition hover:brightness-110"
            >
              Unlock de memes
              <UnlockIcon />
            </button>
          )}
        </div>
      </section>
      {accessDialogOpen && (
        <AccessGate
          question={question}
          onClose={() => setAccessDialogOpen(false)}
          onGranted={() => {
            setAccessDialogOpen(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}

function UnlockIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-5 w-5">
      <path d="M10 2a4 4 0 0 0-4 4v2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1V6a4 4 0 0 0-4-4Zm2 6H8V6a2 2 0 1 1 4 0v2Zm-2 3a1.5 1.5 0 0 0-.75 2.8V15a.75.75 0 0 0 1.5 0v-1.2A1.5 1.5 0 0 0 10 11Z" />
    </svg>
  );
}

function ArrowDown() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-5 w-5">
      <path fillRule="evenodd" d="M10 3a1 1 0 0 1 1 1v9.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-5 5a1 1 0 0 1-1.414 0l-5-5a1 1 0 1 1 1.414-1.414L9 13.586V4a1 1 0 0 1 1-1Z" clipRule="evenodd" />
    </svg>
  );
}
