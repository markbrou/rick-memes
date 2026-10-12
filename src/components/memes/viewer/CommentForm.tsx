"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createCommentSchema } from "@/lib/memeValidation";
import { getRememberedAuthor, rememberAuthor } from "@/lib/rememberedAuthor";
import { usePostContext } from "../post/PostProvider";

type FormFields = z.infer<typeof createCommentSchema>;

export default function CommentForm({ memeId }: { memeId: string }) {
  const { refreshFeed, showToast } = usePostContext();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: { author: getRememberedAuthor(), text: "" },
  });

  async function submit(fields: FormFields) {
    try {
      const response = await fetch(`/api/memes/${encodeURIComponent(memeId)}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (!response.ok) throw new Error("Reactie plaatsen is niet gelukt");

      rememberAuthor(fields.author);
      reset({ author: fields.author.trim(), text: "" });
      refreshFeed();
      showToast("Reactie geplaatst");
    } catch (error) {
      setError("root", { message: error instanceof Error ? error.message : "Reactie plaatsen is niet gelukt" });
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="mt-4 grid gap-2 border-t border-cream-dark pt-4">
      <input
        {...register("author")}
        aria-label="Je naam"
        placeholder="Je naam"
        className="w-full rounded-md border border-merle/25 bg-cream px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
      {errors.author && <p className="text-xs text-red-700">{errors.author.message}</p>}
      <textarea
        {...register("text")}
        aria-label="Reactie"
        placeholder="Schrijf een reactie..."
        rows={2}
        className="w-full resize-none rounded-md border border-merle/25 bg-cream px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
      {errors.text && <p className="text-xs text-red-700">{errors.text.message}</p>}
      {errors.root && <p className="text-xs text-red-700">{errors.root.message}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="justify-self-end rounded-md bg-accent px-4 py-2 text-sm font-bold text-on-accent disabled:cursor-wait disabled:opacity-60"
      >
        {isSubmitting ? "Bezig met plaatsen..." : "Reageren"}
      </button>
    </form>
  );
}