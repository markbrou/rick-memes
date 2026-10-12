"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AccessGate({ question }: { question: string }) {
  const router = useRouter();
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Binnenkomen is niet gelukt. Probeer het opnieuw.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-cream px-6 py-12 text-merle-dark">
      <div className="w-full max-w-sm">
        <p className="mb-3 text-sm font-bold text-accent">RickMemes</p>
        <h1 className="text-3xl font-black">De Rick-check</h1>
        <p className="mt-2 text-sm text-merle">Alleen voor ingewijden. Rick heeft al genoeg aan ons.</p>
        <form onSubmit={submit} className="mt-8 grid gap-4">
          <label className="grid gap-2 text-sm font-semibold">
            {question}
            <input
              type="password"
              autoComplete="off"
              required
              maxLength={200}
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="Jouw antwoord"
              className="w-full rounded-lg border border-merle/25 bg-white px-3 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </label>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={submitting} className="rounded-lg bg-accent px-4 py-3 text-sm font-bold text-on-accent disabled:opacity-60">
            {submitting ? "Even controleren..." : "Laat me binnen"}
          </button>
        </form>
      </div>
    </main>
  );
}