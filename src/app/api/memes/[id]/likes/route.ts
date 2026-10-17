import { and, count, eq } from "drizzle-orm";
import { getDatabase } from "@/db";
import { memeLikes, memes } from "@/db/schema";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Context) {
  const body = await request.json().catch(() => null);
  if (typeof body?.author !== "string" || !body.author.trim() || body.author.trim().length > 50) {
    return Response.json({ error: "Stel eerst een geldige naam in" }, { status: 400 });
  }

  const author = body.author.trim().toLowerCase();
  const { id: memeId } = await params;
  const db = getDatabase();
  const meme = await db.query.memes.findFirst({
    where: eq(memes.id, memeId),
    columns: { id: true },
  });
  if (!meme) return Response.json({ error: "Meme niet gevonden" }, { status: 404 });

  const result = await db.transaction(async (tx) => {
    const existing = await tx
      .select({ author: memeLikes.author })
      .from(memeLikes)
      .where(and(eq(memeLikes.memeId, memeId), eq(memeLikes.author, author)))
      .limit(1);

    if (existing.length > 0) {
      await tx
        .delete(memeLikes)
        .where(and(eq(memeLikes.memeId, memeId), eq(memeLikes.author, author)));
    } else {
      await tx
        .insert(memeLikes)
        .values({ memeId, author })
        .onConflictDoNothing();
    }

    const [currentLike] = await tx
      .select({ author: memeLikes.author })
      .from(memeLikes)
      .where(and(eq(memeLikes.memeId, memeId), eq(memeLikes.author, author)))
      .limit(1);
    const [total] = await tx
      .select({ count: count() })
      .from(memeLikes)
      .where(eq(memeLikes.memeId, memeId));

    return { liked: Boolean(currentLike), likeCount: Number(total.count) };
  });

  return Response.json(result);
}