import { MessageSquare } from "lucide-react";

export default function CommentIcon({ className = "h-6 w-6", count }: { className?: string; count?: number }) {
  const hasComments = (count ?? 0) > 0;

  return (
    <span aria-hidden="true" className={`relative inline-flex shrink-0 ${hasComments ? "text-accent" : "text-merle"} ${className}`}>
      <MessageSquare className={`h-full w-full ${hasComments ? "fill-accent/15" : "fill-none"}`} />
      {count !== undefined && (
        <span className="absolute inset-x-0 top-1/2 -translate-y-[60%] text-center text-[9px] font-bold leading-none">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </span>
  );
}