import { ZipArchive } from "archiver";
import { asc } from "drizzle-orm";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { getDatabase } from "@/db";
import { memes } from "@/db/schema";
import { getAdminCookie, isValidAdminSession } from "@/lib/adminAuth";
import { resolveLocalMediaUrl } from "@/lib/localMedia";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isValidAdminSession(getAdminCookie(request))) {
    return Response.json({ error: "Beheermodus vereist" }, { status: 403 });
  }

  const posts = await getDatabase().select({
    id: memes.id,
    title: memes.title,
    thumbnail: memes.thumbnail,
    videoSrc: memes.videoSrc,
  }).from(memes).orderBy(asc(memes.postedAt));

  const archive = new ZipArchive({ zlib: { level: 1 } });
  const included = new Set<string>();

  for (const post of posts) {
    const directory = post.id.replace(/[^a-zA-Z0-9_-]/g, "_");
    const media = [
      { url: post.thumbnail, name: "thumbnail" },
      { url: post.videoSrc, name: "video" },
    ];

    for (const asset of media) {
      const filePath = resolveLocalMediaUrl(asset.url);
      if (!filePath || included.has(filePath)) continue;

      try {
        const file = await stat(filePath);
        if (!file.isFile()) continue;
      } catch {
        continue;
      }

      included.add(filePath);
      const extension = filePath.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "bin";
      archive.file(filePath, { name: `memes/${directory}/${asset.name}.${extension}` });
    }
  }

  const stream = Readable.toWeb(archive) as ReadableStream;
  archive.finalize();

  return new Response(stream, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": 'attachment; filename="rick-memes-export.zip"',
      "Content-Type": "application/zip",
    },
  });
}