import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const extensions: Record<string, string> = {
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

export function getUploadRoot() {
  return path.resolve(process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads"));
}

export function resolveMediaPath(parts: string[]) {
  const root = getUploadRoot();
  const filePath = path.resolve(root, ...parts);
  return filePath.startsWith(`${root}${path.sep}`) ? filePath : null;
}

export async function saveMedia(file: File) {
  const extension = extensions[file.type];
  if (!extension) throw new Error("Unsupported media type");

  const year = new Date().getUTCFullYear().toString();
  const key = `${year}/${crypto.randomUUID()}.${extension}`;
  const filePath = resolveMediaPath(key.split("/"));
  if (!filePath) throw new Error("Invalid media path");

  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, Buffer.from(await file.arrayBuffer()), { flag: "wx" });

  return { key, publicUrl: `/api/media/${key}` };
}

export function getMediaContentType(filePath: string) {
  const extension = path.extname(filePath).slice(1).toLowerCase();
  return Object.entries(extensions).find(([, value]) => value === extension)?.[0] ?? "application/octet-stream";
}

export async function removeLocalMedia(publicUrl: string | null) {
  if (!publicUrl) return;

  let parts: string[];
  try {
    const pathname = new URL(publicUrl, "http://local").pathname;
    if (!pathname.startsWith("/api/media/")) return;
    parts = pathname.slice("/api/media/".length).split("/").map(decodeURIComponent);
  } catch {
    return;
  }

  const filePath = resolveMediaPath(parts);
  if (!filePath) return;

  try {
    await unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}