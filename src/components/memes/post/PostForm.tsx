"use client";

import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getRememberedAuthor, rememberAuthor } from "@/lib/rememberedAuthor";
import { inspectMedia, uploadMedia } from "./media";

const formSchema = z.object({
  title: z.string().trim().min(1, "Vul een titel in").max(60, "Een titel mag maximaal 60 tekens bevatten"),
  author: z.string().trim().min(1, "Vul je naam in").max(50),
  bio: z.string().trim().max(500, "Een bijschrift mag maximaal 500 tekens bevatten"),
});

type FormFields = z.infer<typeof formSchema>;

type Props = {
  onClose: () => void;
  onCreated: () => void;
};

const acceptedTypes = "image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm";
const fieldClass =
  "w-full rounded-lg border border-merle/25 bg-cream px-3 py-2.5 font-normal outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";

export default function PostForm({ onClose, onCreated }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const previewUrlRef = useRef("");
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", author: getRememberedAuthor(), bio: "" },
  });

  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isSubmitting, onClose]);

  async function submit(fields: FormFields) {
    if (!file) {
      setFileError("Kies een afbeelding of video");
      return;
    }

    try {
      const type = file.type.startsWith("video/") ? "video" : "meme";
      const details = await inspectMedia(file);
      const mediaUpload = await uploadMedia(file, file.name);
      const thumbnailUpload = details.thumbnail
        ? await uploadMedia(details.thumbnail, `${file.name}-thumbnail.jpg`)
        : mediaUpload;

      const response = await fetch("/api/memes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fields,
          bio: fields.bio || undefined,
          type,
          thumbnail: thumbnailUpload.publicUrl,
          videoSrc: type === "video" ? mediaUpload.publicUrl : undefined,
          width: details.width,
          height: details.height,
        }),
      });
      if (!response.ok) throw new Error("Bericht opslaan is niet gelukt");

      rememberAuthor(fields.author);
      onCreated();
    } catch (error) {
      setError("root", { message: error instanceof Error ? error.message : "Bericht plaatsen is niet gelukt" });
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="post-form-title"
      onMouseDown={(event) => event.target === event.currentTarget && !isSubmitting && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-merle-dark/80 p-4 backdrop-blur-sm"
    >
      <form
        onSubmit={handleSubmit(submit)}
        className="relative grid max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl md:grid-cols-[minmax(0,1fr)_22rem]"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          aria-label="Sluiten"
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-merle-dark/70 text-xl text-white disabled:opacity-50"
        >
          ×
        </button>

        <label className="relative flex min-h-64 cursor-pointer items-center justify-center overflow-hidden bg-merle-dark md:min-h-[34rem]">
          <input
            type="file"
            accept={acceptedTypes}
            className="sr-only"
            onChange={(event) => {
              const selected = event.target.files?.[0] ?? null;
              if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
              previewUrlRef.current = selected ? URL.createObjectURL(selected) : "";
              setFile(selected);
              setPreviewUrl(previewUrlRef.current);
              setFileError(selected ? "" : "Choose an image or video");
            }}
          />
          {!previewUrl ? (
            <span className="rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white">Media kiezen</span>
          ) : file?.type.startsWith("video/") ? (
            <video src={previewUrl} controls className="max-h-[60dvh] max-w-full" />
          ) : (
            <Image src={previewUrl} alt="Selected media preview" fill unoptimized className="object-contain" />
          )}
        </label>

        <div className="flex flex-col gap-5 p-6 pt-16 md:pt-6">
          <div>
            <h2 id="post-form-title" className="text-2xl font-black">Meme plaatsen</h2>
            <p className="mt-1 text-sm text-merle">Deel een nieuw Rick-moment.</p>
          </div>

          <Field label="Titel" error={errors.title?.message}>
            <input {...register("title")} maxLength={60} className={fieldClass} placeholder="Wat heeft Rick nou weer gedaan?" />
          </Field>
          <Field label="Je naam" error={errors.author?.message}>
            <input {...register("author")} className={fieldClass} placeholder="Rick" />
          </Field>
          <Field label="Bijschrift (optioneel)" error={errors.bio?.message}>
            <textarea {...register("bio")} maxLength={500} className={`${fieldClass} min-h-28 resize-y`} placeholder="Vertel het verhaal achter deze meme..." />
          </Field>

          {fileError && <p className="text-sm font-semibold text-red-700">{fileError}</p>}
          {errors.root?.message && <p className="text-sm font-semibold text-red-700">{errors.root.message}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-auto rounded-lg bg-accent px-5 py-3 font-bold text-on-accent disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting ? "Bezig met plaatsen..." : "Meme plaatsen"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold">
      {label}
      {children}
      {error && <span className="font-normal text-red-700">{error}</span>}
    </label>
  );
}
