"use client";

import { usePostContext } from "@/components/memes/post/PostProvider";

export default function SiteFooter() {
  const { adminMode, openAdminDialog, disableAdminMode } = usePostContext();

  return (
    <footer className="grid grid-cols-2 items-center gap-y-3 border-t border-accent/20 bg-cream-dark px-4 py-5 text-sm text-merle sm:grid-cols-[1fr_auto_1fr] sm:py-6">
      <span className="col-span-2 text-center sm:col-span-1 sm:col-start-2">
        Stichting Blijf Rick Pesten &copy; {new Date().getFullYear()}. - Rick, we pesten je uit liefde. Meestal.
      </span>
      <button
        type="button"
        onClick={() => adminMode ? void disableAdminMode() : openAdminDialog()}
        className="col-span-2 justify-self-end text-xs font-semibold underline decoration-merle/40 underline-offset-4 hover:text-merle-dark sm:col-span-1 sm:col-start-3"
      >
        {adminMode ? "Beheermodus afsluiten" : "Beheer"}
      </button>
    </footer>
  );
}
