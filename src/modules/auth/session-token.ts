import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SESSION_SECRET = process.env.SESSION_SECRET || process.env.BETTER_AUTH_SECRET || "default-secret-change-me";

console.log("[SESSION-TOKEN] Module loaded. SESSION_SECRET source:", process.env.SESSION_SECRET ? "SESSION_SECRET" : process.env.BETTER_AUTH_SECRET ? "BETTER_AUTH_SECRET" : "DEFAULT_FALLBACK");
console.log("[SESSION-TOKEN] SESSION_SECRET key derivation:", SESSION_SECRET.padEnd(32).slice(0, 32).substring(0, 4) + "..." + SESSION_SECRET.padEnd(32).slice(0, 32).slice(-4));

export const SESSION_COOKIE_NAME = "storefront_session";

export type SessionPayload = {
  userId: string;
  email: string;
  accountStatus?: "incomplete" | "active";
  iat?: number;
  exp?: number;
};

function encrypt(text: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, Buffer.from(SESSION_SECRET.padEnd(32).slice(0, 32)), iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

function decrypt(data: string): string {
  const decoded = decodeURIComponent(data);
  console.log("[SESSION-TOKEN] decrypt input preview:", data.substring(0, 30), "... decoded preview:", decoded.substring(0, 30), "...");
  const [ivHex, authTagHex, encrypted] = decoded.split(":");
  if (!ivHex || !authTagHex || !encrypted) {
    throw new Error("Invalid session token format");
  }
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = createDecipheriv(ALGORITHM, Buffer.from(SESSION_SECRET.padEnd(32).slice(0, 32)), iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export function createSessionToken(payload: SessionPayload): string {
  console.log("[SESSION-TOKEN] createSessionToken called with payload:", JSON.stringify(payload));
  const data = JSON.stringify({
    ...payload,
    iat: Date.now(),
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000,
  });
  const token = encrypt(data);
  console.log("[SESSION-TOKEN] Token created, length:", token.length);
  return token;
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    console.log("[SESSION-TOKEN] verifySessionToken called, token length:", token.length);
    const decrypted = decrypt(token);
    console.log("[SESSION-TOKEN] Decrypted successfully, payload preview:", decrypted.substring(0, 200));
    const payload = JSON.parse(decrypted) as SessionPayload;
    if (payload.exp && Date.now() > payload.exp) {
      console.log("[SESSION-TOKEN] Token EXPIRED. exp:", new Date(payload.exp).toISOString(), "now:", new Date().toISOString());
      return null;
    }
    console.log("[SESSION-TOKEN] Token valid. userId:", payload.userId, "email:", payload.email);
    return payload;
  } catch (err) {
    console.error("[SESSION-TOKEN] Decryption/parse FAILED:", err);
    return null;
  }
}
