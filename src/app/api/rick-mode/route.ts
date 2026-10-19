const acceptedAnswers = new Set(["colloseo6", "collosseo6", "coloseo6", "colosseo6"]);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (typeof body?.passphrase !== "string" || !acceptedAnswers.has(body.passphrase.trim().toLowerCase())) {
    return Response.json({ error: "Fout! Opnieuw!" }, { status: 401 });
  }

  return Response.json({ enabled: true });
}