import { createHmac, createHash, timingSafeEqual } from "node:crypto";

export const adminCookieName = "rick_admin";
const sessionDurationSeconds = 8 * 60 * 60;

function configuredPassphrase() {
  return process.env.ADMIN_PASSPHRASE;
}

function sign(value: string, passphrase: string) {
  return createHmac("sha256", passphrase).update(value).digest("base64url");
}

export function isAdminConfigured() {
  return Boolean(configuredPassphrase());
}

export function verifyAdminPassphrase(candidate: string) {
  const passphrase = configuredPassphrase();
  if (!passphrase) return false;
  const candidateDigest = createHash("sha256").update(candidate).digest();
  const passphraseDigest = createHash("sha256").update(passphrase).digest();
  return timingSafeEqual(candidateDigest, passphraseDigest);
}

export function createAdminSession() {
  const passphrase = configuredPassphrase();
  if (!passphrase) throw new Error("ADMIN_PASSPHRASE is not configured");
  const expiresAt = Math.floor(Date.now() / 1000) + sessionDurationSeconds;
  const payload = String(expiresAt);
  return `${payload}.${sign(payload, passphrase)}`;
}

export function isValidAdminSession(token: string | undefined) {
  const passphrase = configuredPassphrase();
  if (!passphrase || !token) return false;

  const [expiresAt, signature, extra] = token.split(".");
  if (!expiresAt || !signature || extra || !/^\d+$/.test(expiresAt)) return false;
  if (Number(expiresAt) <= Math.floor(Date.now() / 1000)) return false;

  const expected = Buffer.from(sign(expiresAt, passphrase));
  const actual = Buffer.from(signature);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function getAdminCookie(request: Request) {
  const cookies = request.headers.get("cookie")?.split(";") ?? [];
  const prefix = `${adminCookieName}=`;
  const entry = cookies.map((cookie) => cookie.trim()).find((cookie) => cookie.startsWith(prefix));
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : undefined;
}

export function adminCookie(token: string, maxAge = sessionDurationSeconds) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${adminCookieName}=${encodeURIComponent(token)}; HttpOnly; Path=/api; SameSite=Strict; Max-Age=${maxAge}${secure}`;
}