import { createHash, randomBytes } from "node:crypto";

export function hashApiKey(rawKey: string) {
  return createHash("sha256").update(rawKey).digest("hex");
}

export function generateRawApiKey() {
  return randomBytes(32).toString("hex");
}