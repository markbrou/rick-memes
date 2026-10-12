import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const accessCookieName = "rick_access";
export const accessDurationSeconds = 7 * 24 * 60 * 60;

export function getAccessQuestion() {
  return process.env.ACCESS_QUESTION ?? "Wat is de naam van Rick zijn hond?";
}

function sessionKey() {
  const secret = process.env.ACCESS_SESSION_SECRET;
  const answer = process.env.ACCESS_ANSWER;
  return secret && answer ? `${secret}:${answer.trim().toLowerCase()}` : null;
}

export function isAccessConfigured() {
  return Boolean(sessionKey());
}

export function verifyAccessAnswer(answer: string) {
  const expected = process.env.ACCESS_ANSWER;
  if (!expected || !sessionKey()) return false;
  const digest = (value: string) => createHash("sha256").update(value.trim().toLowerCase()).digest();
  return timingSafeEqual(digest(answer), digest(expected));
}

export function createAccessSession() {
  const key = sessionKey();
  if (!key) throw new Error("Site access is not configured");
  const expires = String(Math.floor(Date.now() / 1000) + accessDurationSeconds);
  const signature = createHmac("sha256", key).update(expires).digest("base64url");
  return `${expires}.${signature}`;
}

export function hasSiteAccess(token: string | undefined) {
  const key = sessionKey();
  if (!key || !token) return false;
  const [expires, signature, extra] = token.split(".");
  if (!expires || !signature || extra || !/^\d+$/.test(expires)) return false;
  if (Number(expires) <= Math.floor(Date.now() / 1000)) return false;
  const expected = Buffer.from(createHmac("sha256", key).update(expires).digest("base64url"));
  const actual = Buffer.from(signature);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}