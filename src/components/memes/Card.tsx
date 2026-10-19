import Image from "next/image";
import type { MemeItem } from "@/data/memes";
import { formatDate } from "@/lib/formatDate";
import mediaLoader from "@/lib/mediaLoader";
import Avatar from "./Avatar";
import CommentIcon from "./CommentIcon";
import ShareButton from "./ShareButton";
import { isRecentMeme } from "@/lib/memeRecency";
import { usePostContext } from "./post/PostProvider";
import RickDeleteButton from "./RickDeleteButton";

type Props = {
  item: MemeItem;
  onOpen: () => void;
  adminMode: boolean;
  deleting: boolean;
  onDelete: () => void;
};

export default function Card({ item, onOpen, adminMode, deleting, onDelete }: Props) {
  const { rickMode } = usePostContext();

  return (
    <article className="group relative overflow-hidden rounded-2xl bg-white text-left shadow-sm ring-1 ring-merle/15 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/20 hover:ring-accent/60">
      <button
        type="button"
        onClick={onOpen}
        className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label={`Bekijk ${item.title}`}
      >
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={item.thumbnail}
            alt={item.title}
            fill
            loader={mediaLoader}
            unoptimized
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
          {item.type === "video" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-merle-dark/60 text-2xl text-white backdrop-blur transition group-hover:scale-110 group-hover:bg-tongue">
                ▶
              </span>
            </div>
          )}
          {isRecentMeme(item.postedAt) && (
            <span className="absolute left-3 top-3 rounded bg-yellow-200 px-2 py-1 text-xs font-bold text-yellow-950 shadow-sm">
              Nieuw!
            </span>
          )}
        </div>
        <div className="px-4 pt-3">
          <h3 className="truncate font-semibold text-merle-dark">{item.title}</h3>
        </div>
      </button>
      <div className="flex items-center gap-2 px-4 pb-3 pt-2">
        <Avatar name={item.author} size="sm" />
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 text-xs text-merle">
          <span className="min-w-0 font-semibold text-merle-dark [overflow-wrap:anywhere]">{item.author}</span>
          <span aria-hidden>·</span>
          <time className="shrink-0" dateTime={item.postedAt}>{formatDate(item.postedAt)}</time>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <ShareButton memeId={item.id} title={item.title} />
          <button
            type="button"
            onClick={onOpen}
            aria-label={`${item.comments?.length ?? 0} reacties op ${item.title}`}
            title="Reacties bekijken"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-merle transition hover:bg-cream-dark hover:text-accent"
          >
            <CommentIcon className="h-5 w-5" count={item.comments?.length ?? 0} />
          </button>
        </div>
      </div>
      {rickMode && <RickDeleteButton title={item.title} />}
      {adminMode && !rickMode && (
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          aria-label={`Verwijder ${item.title}`}
          title="Bericht verwijderen"
          className="absolute right-3 top-3 z-10 flex h-10 items-center gap-2 rounded-full bg-red-700 px-3 text-sm font-bold text-white shadow-lg hover:bg-red-800 disabled:cursor-wait disabled:opacity-60"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-4 w-4">
            <path fillRule="evenodd" d="M8.5 2a1 1 0 0 0-.894.553L7.382 3H5a1 1 0 0 0 0 2h10a1 1 0 1 0 0-2h-2.382l-.224-.447A1 1 0 0 0 11.5 2h-3ZM6 7a1 1 0 0 0-1 1v7a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3V8a1 1 0 1 0-2 0v7a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V8a1 1 0 0 0-1-1Zm3 2a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0v-4a1 1 0 0 0-1-1Zm3 0a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0v-4a1 1 0 0 0-1-1Z" clipRule="evenodd" />
          </svg>
          Verwijderen
        </button>
      )}
    </article>
  );
}
