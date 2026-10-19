"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import AdminDialog from "./AdminDialog";
import PostForm from "./PostForm";

type PostContextValue = {
  baseUrl: string;
  memeCount: number | null;
  setMemeCount: (count: number) => void;
  openPostForm: () => void;
  revision: number;
  refreshFeed: () => void;
  showToast: (message: string) => void;
  adminMode: boolean;
  openAdminDialog: () => void;
  disableAdminMode: () => Promise<void>;
  rickMode: boolean;
  openRickDialog: () => void;
  disableRickMode: () => void;
};

const PostContext = createContext<PostContextValue | null>(null);

export default function PostProvider({
  children,
  hasSiteAccess,
  baseUrl,
}: {
  children: React.ReactNode;
  hasSiteAccess: boolean;
  baseUrl: string;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [revision, setRevision] = useState(0);
  const [memeCount, setMemeCount] = useState<number | null>(null);
  const [toast, setToast] = useState("");
  const [adminMode, setAdminMode] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [rickMode, setRickMode] = useState(false);
  const [rickDialogOpen, setRickDialogOpen] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshFeed = () => setRevision((value) => value + 1);
  const showToast = (message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(""), 3500);
  };
  const disableAdminMode = async () => {
    await fetch("/api/admin/session", { method: "DELETE" });
    setAdminMode(false);
    showToast("Beheermodus uitgeschakeld");
  };

  useEffect(() => {
    if (!hasSiteAccess) return;

    const controller = new AbortController();
    fetch("/api/admin/session", { cache: "no-store", signal: controller.signal })
      .then((response) => response.json())
      .then((session: { enabled?: boolean }) => setAdminMode(Boolean(session.enabled)))
      .catch(() => {
        if (!controller.signal.aborted) setAdminMode(false);
      });
    return () => controller.abort();
  }, [hasSiteAccess]);

  return (
    <PostContext value={{
      baseUrl,
      memeCount,
      setMemeCount,
      openPostForm: () => setFormOpen(true),
      revision,
      refreshFeed,
      showToast,
      adminMode,
      openAdminDialog: () => setAdminDialogOpen(true),
      disableAdminMode,
      rickMode,
      openRickDialog: () => setRickDialogOpen(true),
      disableRickMode: () => {
        setRickMode(false);
        showToast("Rick modus uitgeschakeld");
      },
    }}>
      {children}
      {rickDialogOpen && (
        <AdminDialog
          mode="rick"
          onClose={() => setRickDialogOpen(false)}
          onEnabled={() => {
            setRickMode(true);
            setRickDialogOpen(false);
            setAdminMode(false);
            showToast("Rick modus ingeschakeld");
          }}
        />
      )}
      {adminDialogOpen && (
        <AdminDialog
          onClose={() => setAdminDialogOpen(false)}
          onEnabled={() => {
            setAdminMode(true);
            setRickMode(false);
            setAdminDialogOpen(false);
            showToast("Beheermodus ingeschakeld");
          }}
        />
      )}
      {formOpen && (
        <PostForm
          onClose={() => setFormOpen(false)}
          onCreated={() => {
            refreshFeed();
            setFormOpen(false);
            showToast("Meme geplaatst");
          }}
        />
      )}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-1/2 z-[60] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center gap-3 rounded-lg bg-merle-dark px-4 py-3 text-sm font-semibold text-white shadow-xl sm:left-auto sm:right-4 sm:w-auto sm:translate-x-0"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-on-accent">✓</span>
          <span className="flex-1">{toast}</span>
          <button
            type="button"
            onClick={() => setToast("")}
            aria-label="Melding sluiten"
            className="text-lg leading-none text-white/70 hover:text-white"
          >
            ×
          </button>
        </div>
      )}
    </PostContext>
  );
}

export function usePostContext() {
  const context = useContext(PostContext);
  if (!context) throw new Error("usePostContext must be used within PostProvider");
  return context;
}
