"use client";

import { useState } from "react";

type Props = {
  onClose: () => void;
  onEnabled: () => void;
  mode?: "admin" | "rick";
};

export default function AdminDialog({ onClose, onEnabled, mode = "admin" }: Props) {
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch(mode === "rick" ? "/api/rick-mode" : "/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Beheermodus inschakelen is niet gelukt");
      onEnabled();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Beheermodus inschakelen is niet gelukt");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && !submitting && onClose()}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-merle-dark/70 p-4 backdrop-blur-sm"
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-dialog-title"
        onSubmit={submit}
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="admin-dialog-title" className="text-lg font-bold">{mode === "rick" ? "Rick modus" : "Beheermodus inschakelen"}</h2>
            {mode === "admin" && (
              <p className="mt-1 text-sm text-merle">Voer de passphrase in om berichten te beheren. Jammer Rick, die heb jij niet xD.</p>
            )}
          </div>
          <button type="button" onClick={onClose} aria-label="Sluiten" className="text-xl text-merle hover:text-merle-dark">×</button>
        </div>
        <label className="mt-5 grid gap-1.5 text-sm font-semibold">
          {mode === "rick" ? "Wat was het Wi-Fi wachtwoord in Rome?" : "Passphrase"}
          <input
            type="password"
            autoComplete="current-password"
            autoFocus
            required
            value={passphrase}
            onChange={(event) => setPassphrase(event.target.value)}
            className="w-full rounded-lg border border-merle/25 bg-cream px-3 py-2.5 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </label>
        {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold text-merle hover:bg-cream-dark">Annuleren</button>
          <button type="submit" disabled={submitting} className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-on-accent disabled:opacity-60">
            {submitting ? "Controleren..." : "Inschakelen"}
          </button>
        </div>
      </form>
    </div>
  );
}