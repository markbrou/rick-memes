import { eq } from "drizzle-orm";
import { getDatabase } from "@/db";
import { memes } from "@/db/schema";
import { getAdminCookie, isValidAdminSession } from "@/lib/adminAuth";
import { removeLocalMedia } from "@/lib/localMedia";

type Context = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, { params }: Context) {
  if (!isValidAdminSession(getAdminCookie(request))) {
    return Response.json({ error: "Beheermodus vereist" }, { status: 403 });
  }

  const { id } = await params;
  const [deleted] = await getDatabase()
    .delete(memes)
    .where(eq(memes.id, id))
    .returning({ thumbnail: memes.thumbnail, videoSrc: memes.videoSrc });

  if (!deleted) return Response.json({ error: "Meme niet gevonden" }, { status: 404 });

  await Promise.all([
    removeLocalMedia(deleted.thumbnail),
    removeLocalMedia(deleted.videoSrc),
  ]);

  return Response.json({ deleted: true });
}