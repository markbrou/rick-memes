const sizes = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-9 w-9 text-sm",
};

export default function Avatar({ name, size = "md" }: { name: string; size?: keyof typeof sizes }) {
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full bg-accent font-bold text-on-accent ${sizes[size]}`}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
