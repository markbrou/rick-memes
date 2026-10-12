import { eq } from "drizzle-orm";
import { getDatabase } from "@/db";
import { comments, memes } from "@/db/schema";
import { createCommentSchema } from "@/lib/memeValidation";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Context) {
  const result = createCommentSchema.safeParse(await request.json().catch(() => null));
  if (!result.success) {
    return Response.json({ error: "Ongeldige reactie", issues: result.error.issues }, { status: 400 });
  }

  const { id: memeId } = await params;
  const meme = await getDatabase().query.memes.findFirst({
    where: eq(memes.id, memeId),
    columns: { id: true },
  });
  if (!meme) return Response.json({ error: "Meme niet gevonden" }, { status: 404 });

  const [created] = await getDatabase()
    .insert(comments)
    .values({
      id: crypto.randomUUID(),
      memeId,
      postedAt: new Date().toISOString().slice(0, 10),
      ...result.data,
    })
    .returning({
      id: comments.id,
      author: comments.author,
      text: comments.text,
      postedAt: comments.postedAt,
    });

  return Response.json(created, { status: 201 });
}