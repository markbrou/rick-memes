import { saveMedia } from "@/lib/localMedia";
import { uploadRequestSchema } from "@/lib/memeValidation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Een mediabestand is verplicht" }, { status: 400 });
  }

  const result = uploadRequestSchema.safeParse({
    fileName: file.name,
    contentType: file.type,
    size: file.size,
  });
  if (!result.success) {
    return Response.json({ error: "Ongeldige upload", issues: result.error.issues }, { status: 400 });
  }

  return Response.json(await saveMedia(file), { status: 201 });
}