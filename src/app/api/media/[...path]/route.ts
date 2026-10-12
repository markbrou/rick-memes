import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { getMediaContentType, resolveMediaPath } from "@/lib/localMedia";

export const runtime = "nodejs";

type Context = { params: Promise<{ path: string[] }> };

export async function GET(request: Request, { params }: Context) {
  const filePath = resolveMediaPath((await params).path);
  if (!filePath) return new Response("Not found", { status: 404 });

  let fileSize: number;
  try {
    fileSize = (await stat(filePath)).size;
  } catch {
    return new Response("Not found", { status: 404 });
  }

  const contentType = getMediaContentType(filePath);
  const range = request.headers.get("range")?.match(/^bytes=(\d*)-(\d*)$/);

  if (range) {
    const start = range[1] ? Number(range[1]) : 0;
    const end = range[2] ? Math.min(Number(range[2]), fileSize - 1) : fileSize - 1;
    if (start > end || start >= fileSize) {
      return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${fileSize}` } });
    }

    const stream = Readable.toWeb(createReadStream(filePath, { start, end })) as ReadableStream;
    return new Response(stream, {
      status: 206,
      headers: {
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": String(end - start + 1),
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream;
  return new Response(stream, {
    headers: {
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": String(fileSize),
      "Content-Type": contentType,
      "X-Content-Type-Options": "nosniff",
    },
  });
}