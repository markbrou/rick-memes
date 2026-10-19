import { ArrowDownWideNarrow, ArrowUpWideNarrow, Shuffle } from "lucide-react";

export type Filter = "all" | "meme" | "video";
export type SortOrder = "random" | "newest" | "oldest";

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "Alles" },
  { value: "meme", label: "Memes" },
  { value: "video", label: "Video's" },
];

type Props = {
  value: Filter;
  onChange: (filter: Filter) => void;
  sortOrder: SortOrder;
  onSortChange: (sort: SortOrder) => void;
};

export default function FilterBar({ value, onChange, sortOrder, onSortChange }: Props) {
  const SortIcon = sortOrder === "random" ? Shuffle : sortOrder === "newest" ? ArrowDownWideNarrow : ArrowUpWideNarrow;
  const sortLabel = sortOrder === "random" ? "Willekeurig" : sortOrder === "newest" ? "Nieuwste eerst" : "Oudste eerst";

  return (
    <div className="mb-8 grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto] lg:grid-cols-[1fr_auto_1fr]">
      <div aria-hidden="true" className="hidden lg:block" />
      <div className="flex justify-center gap-2">
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          aria-pressed={value === f.value}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            value === f.value
              ? "bg-accent text-on-accent shadow-lg shadow-accent/30"
              : "bg-white text-merle ring-1 ring-accent/20 hover:bg-cream-dark"
          }`}
        >
          {f.label}
        </button>
      ))}
      </div>
      <label
        title={`Sorteren: ${sortLabel}`}
        className="relative inline-flex h-10 items-center justify-center justify-self-center gap-2 whitespace-nowrap rounded-full bg-white px-4 text-sm font-semibold text-merle ring-1 ring-accent/20 transition hover:bg-cream-dark focus-within:ring-2 focus-within:ring-accent sm:justify-self-end"
      >
        <SortIcon size={18} aria-hidden="true" />
        <span>{sortLabel}</span>
        <select
          aria-label="Sorteren"
          value={sortOrder}
          onChange={(event) => onSortChange(event.target.value as SortOrder)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        >
          <option value="random">Willekeurig</option>
          <option value="newest">Nieuwste eerst</option>
          <option value="oldest">Oudste eerst</option>
        </select>
      </label>
    </div>
  );
}
