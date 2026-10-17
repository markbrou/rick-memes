import { asc, count, desc, eq } from "drizzle-orm";
import { getDatabase } from "@/db";
import { comments, memeLikes, memes } from "@/db/schema";
import { createMemeSchema } from "@/lib/memeValidation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const author = new URL(request.url).searchParams.get("author")?.trim().toLowerCase() ?? "";
  const db = getDatabase();
  const data = await db.query.memes.findMany({
    orderBy: desc(memes.postedAt),
    with: {
      comments: {
        orderBy: asc(comments.postedAt),
        columns: { memeId: false },
      },
    },
  });

  const likeCounts = await db
    .select({ memeId: memeLikes.memeId, count: count() })
    .from(memeLikes)
    .groupBy(memeLikes.memeId);
  const likedRows = author
    ? await db.select({ memeId: memeLikes.memeId }).from(memeLikes).where(eq(memeLikes.author, author))
    : [];
  const countByMeme = new Map(likeCounts.map((row) => [row.memeId, Number(row.count)]));
  const likedMemeIds = new Set(likedRows.map((row) => row.memeId));

  return Response.json(data.map((meme) => ({
    ...meme,
    likeCount: countByMeme.get(meme.id) ?? 0,
    liked: likedMemeIds.has(meme.id),
  })));
}

export async function POST(request: Request) {
  const result = createMemeSchema.safeParse(await request.json().catch(() => null));
  if (!result.success) {
    return Response.json({ error: "Ongeldige meme", issues: result.error.issues }, { status: 400 });
  }

  const [created] = await getDatabase()
    .insert(memes)
    .values({
      id: crypto.randomUUID(),
      postedAt: new Date().toISOString().slice(0, 10),
      ...result.data,
      bio: result.data.bio || null,
    })
    .returning();

  return Response.json({ ...created, comments: [] }, { status: 201 });
}