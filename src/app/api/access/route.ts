import { NextResponse } from "next/server";
import { accessCookieName, accessDurationSeconds, createAccessSession, isAccessConfigured, verifyAccessAnswer } from "@/lib/siteAccess";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const originUrl = origin && URL.canParse(origin) ? new URL(origin) : null;
  const host = request.headers.get("host") ?? new URL(request.url).host;
  if (!originUrl || !["http:", "https:"].includes(originUrl.protocol) || originUrl.host !== host) {
    return NextResponse.json({ error: "Ongeldig verzoek" }, { status: 403 });
  }
  if (!isAccessConfigured()) {
    return NextResponse.json({ error: "De toegang is nog niet ingesteld." }, { status: 503 });
  }
  const body = await request.json().catch(() => null);
  if (typeof body?.answer !== "string" || body.answer.length > 200 || !verifyAccessAnswer(body.answer)) {
    return NextResponse.json({ error: "Dat is niet de naam die we zoeken. Probeer het nog eens!" }, { status: 401 });
  }
  const response = NextResponse.json({ granted: true });
  response.headers.set("Cache-Control", "no-store");
  response.cookies.set(accessCookieName, createAccessSession(), {
    httpOnly: true,
    sameSite: "strict",
    secure: new URL(request.url).protocol === "https:",
    path: "/",
    maxAge: accessDurationSeconds,
  });
  return response;
}