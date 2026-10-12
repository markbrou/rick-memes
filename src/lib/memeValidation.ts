import { z } from "zod";

export const mediaTypes = [
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
] as const;

export const uploadRequestSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  contentType: z.enum(mediaTypes),
  size: z.number().int().positive().max(100 * 1024 * 1024),
});

export const createCommentSchema = z.object({
  author: z.string().trim().min(1).max(50),
  text: z.string().trim().min(1).max(500),
});

export const createMemeSchema = z
  .object({
    title: z.string().trim().min(1).max(100),
    author: z.string().trim().min(1).max(50),
    bio: z.string().trim().max(1000).optional(),
    type: z.enum(["meme", "video"]),
    thumbnail: z.string().refine((value) => value.startsWith("/api/media/") || URL.canParse(value), "Invalid media URL"),
    videoSrc: z.string().refine((value) => value.startsWith("/api/media/") || URL.canParse(value), "Invalid media URL").optional(),
    width: z.number().int().positive().max(10000),
    height: z.number().int().positive().max(10000),
  })
  .refine((value) => value.type !== "video" || value.videoSrc, {
    message: "A video source is required for video posts",
    path: ["videoSrc"],
  });
