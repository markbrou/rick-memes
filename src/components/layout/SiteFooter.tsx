"use client";

import { usePostContext } from "@/components/memes/post/PostProvider";

export default function SiteFooter({ showAdminAction }: { showAdminAction: boolean }) {
  const { adminMode, openAdminDialog, disableAdminMode } = usePostContext();

  return (
    <footer className="grid grid-cols-2 items-center gap-y-3 border-t border-accent/20 bg-cream-dark px-4 py-5 text-sm text-merle sm:grid-cols-[1fr_auto_1fr] sm:py-6">
      <div className="col-span-2 row-start-1 text-center sm:col-span-1 sm:col-start-2">
        <p className="font-semibold">Stichting Blijf Rick Pesten &copy; 2026</p>
        <p className="mt-1 text-xs text-merle/80">
          Website: <span className="font-semibold text-merle-dark">Mark</span> · Hosting: <span className="font-semibold text-merle-dark">LuukHorsmanHomeLab</span>
        </p>
      </div>
      {adminMode && (
        <a
          href="/api/admin/export"
          download="rick-memes-export.zip"
          aria-label="Download alle memes als ZIP"
          title="Download alle meme-media als ZIP"
          className="col-start-1 row-start-2 inline-flex items-center gap-2 justify-self-start text-xs font-semibold text-merle underline decoration-merle/40 underline-offset-4 hover:text-merle-dark sm:col-start-1 sm:row-start-1"
        >
          <DownloadIcon />
          Exporteren
        </a>
      )}
      {showAdminAction && (
        <button
          type="button"
          onClick={() => adminMode ? void disableAdminMode() : openAdminDialog()}
          className="col-start-2 row-start-2 justify-self-end text-xs font-semibold underline decoration-merle/40 underline-offset-4 hover:text-merle-dark sm:col-span-1 sm:col-start-3 sm:row-start-1"
        >
          {adminMode ? "Beheermodus afsluiten" : "Beheer"}
        </button>
      )}
    </footer>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4">
      <path fillRule="evenodd" d="M10 2.75a.75.75 0 0 1 .75.75v7.69l2.22-2.22a.75.75 0 1 1 1.06 1.06l-3.5 3.5a.75.75 0 0 1-1.06 0l-3.5-3.5a.75.75 0 1 1 1.06-1.06l2.22 2.22V3.5a.75.75 0 0 1 .75-.75ZM3.5 14.25a.75.75 0 0 1 .75.75v1.5h11.5V15a.75.75 0 0 1 1.5 0v2.25a.75.75 0 0 1-.75.75h-13a.75.75 0 0 1-.75-.75V15a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
    </svg>
  );
}
