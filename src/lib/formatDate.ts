export function formatDate(iso: string, style: "short" | "long" = "short") {
  return new Date(iso).toLocaleDateString(
    "nl-NL",
    style === "short" ? { month: "short", day: "numeric" } : { month: "long", day: "numeric", year: "numeric" },
  );
}
