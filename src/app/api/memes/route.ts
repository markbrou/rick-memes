import { asc, desc } from "drizzle-orm";
import { getDatabase } from "@/db";
import { comments, memes } from "@/db/schema";
import { createMemeSchema } from "@/lib/memeValidation";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getDatabase().query.memes.findMany({
    orderBy: desc(memes.postedAt),
    with: {
      comments: {
        orderBy: asc(comments.postedAt),
        columns: { memeId: false },
      },
    },
  });

  return Response.json(data);
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