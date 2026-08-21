import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const configuredSessionSecret = process.env.SESSION_SECRET;

if (!configuredSessionSecret || configuredSessionSecret.length < 32) {
  throw new Error("SESSION_SECRET must be set to a value of at least 32 characters");
}

const SESSION_SECRET: string = configuredSessionSecret;

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
  const data = JSON.stringify({
    ...payload,
    iat: Date.now(),
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000,
  });
  const token = encrypt(data);
  return token;
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const decrypted = decrypt(token);
    const payload = JSON.parse(decrypted) as SessionPayload;
    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch (err) {
    console.error("[SESSION-TOKEN] Decryption/parse FAILED:", err);
    return null;
  }
}
