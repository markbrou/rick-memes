import type { Comment } from "@/data/memes";
import { formatDate } from "@/lib/formatDate";
import Avatar from "../Avatar";

export default function Comments({ comments }: { comments: Comment[] }) {
  return (
    <section aria-label="Reacties" className="mt-5 border-t border-cream-dark pt-4">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-merle">
        Reacties ({comments.length})
      </h3>
      {comments.length === 0 ? (
        <p className="text-sm text-merle">Nog geen reacties.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="flex gap-3">
              <Avatar name={c.author} size="sm" />
              <div className="min-w-0 text-sm">
                <p className="leading-snug">
                  <span className="mr-1.5 font-semibold">{c.author}</span>
                  {c.text}
                </p>
                <time dateTime={c.postedAt} className="text-xs text-merle">
                  {formatDate(c.postedAt)}
                </time>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
