import {
  adminCookie,
  createAdminSession,
  getAdminCookie,
  isAdminConfigured,
  isValidAdminSession,
  verifyAdminPassphrase,
} from "@/lib/adminAuth";

export function GET(request: Request) {
  return Response.json({
    configured: isAdminConfigured(),
    enabled: isValidAdminSession(getAdminCookie(request)),
  });
}

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return Response.json({ error: "Beheermodus is niet ingesteld op de server" }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  if (typeof body?.passphrase !== "string" || !verifyAdminPassphrase(body.passphrase)) {
    return Response.json({ error: "Onjuiste passphrase" }, { status: 401 });
  }

  return Response.json(
    { enabled: true },
    { headers: { "Set-Cookie": adminCookie(createAdminSession()) } },
  );
}

export function DELETE() {
  return Response.json(
    { enabled: false },
    { headers: { "Set-Cookie": adminCookie("", 0) } },
  );
}