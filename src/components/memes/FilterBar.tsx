export type Filter = "all" | "meme" | "video";

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "Alles" },
  { value: "meme", label: "Memes" },
  { value: "video", label: "Video's" },
];

type Props = {
  value: Filter;
  onChange: (filter: Filter) => void;
};

export default function FilterBar({ value, onChange }: Props) {
  return (
    <div className="mb-8 flex justify-center gap-2">
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          aria-pressed={value === f.value}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
            value === f.value
              ? "bg-accent text-on-accent shadow-lg shadow-accent/30"
              : "bg-white text-merle ring-1 ring-accent/20 hover:bg-cream-dark"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
