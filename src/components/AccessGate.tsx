"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  question: string;
  onClose: () => void;
  onGranted: () => void;
};

export default function AccessGate({ question, onClose, onGranted }: Props) {
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsVisible(true));
    return () => {
      cancelAnimationFrame(frame);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  function dismiss(afterClose = onClose) {
    if (submitting || closeTimer.current) return;
    setIsVisible(false);
    closeTimer.current = setTimeout(afterClose, 160);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer }),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error);
      }
      dismiss(onGranted);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Binnenkomen is niet gelukt. Probeer het opnieuw.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && dismiss()}
      className={`fixed inset-0 z-[80] flex items-center justify-center bg-merle-dark/75 p-4 backdrop-blur-sm transition-opacity duration-[160ms] motion-reduce:transition-none ${
        isVisible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="access-gate-title"
        className={`relative w-full max-w-md rounded-2xl bg-cream p-6 text-merle-dark shadow-2xl transition duration-[160ms] motion-reduce:transition-none sm:p-8 ${
          isVisible ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-95 opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={() => dismiss()}
          disabled={submitting}
          aria-label="Sluiten"
          className="absolute right-4 top-3 rounded-full px-2 text-2xl text-merle hover:text-merle-dark"
        >
          ×
        </button>
        <p className="mb-2 text-sm font-bold text-accent">RickMemes</p>
        <h2 id="access-gate-title" className="text-2xl font-black">Hold up!</h2>
        <p className="mt-3 text-sm leading-relaxed text-merle">
          Rick mag natuurlijk alleen gepest worden door zijn béste vrienden! Dus even een check...
        </p>
        <form onSubmit={submit} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-semibold">
            {question}
            <input
              type="password"
              autoComplete="off"
              required
              maxLength={200}
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="Zeg het maar..."
              className="w-full rounded-lg border border-merle/25 bg-white px-3 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </label>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={submitting} className="rounded-lg bg-accent px-4 py-3 text-sm font-bold text-on-accent disabled:opacity-60">
            {submitting ? "Even controleren..." : "Let me in!"}
          </button>
        </form>
      </section>
    </div>
  );
}