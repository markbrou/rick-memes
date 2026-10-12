import { NextRequest, NextResponse } from "next/server";
import { accessCookieName, hasSiteAccess } from "@/lib/siteAccess";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/api/access") return NextResponse.next();
  if (!hasSiteAccess(request.cookies.get(accessCookieName)?.value)) {
    return NextResponse.json(
      { error: "Beantwoord eerst de toegangsvraag." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }
  const response = NextResponse.next();
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: ["/api/:path*", "/memes/:path*", "/videos/:path*", "/_next/image"],
};