import { pbkdf2Sync, randomBytes } from "node:crypto";

const PASSWORD_SECRET = process.env.SESSION_SECRET;

if (!PASSWORD_SECRET) {
  throw new Error("SESSION_SECRET is required");
}
const ITERATIONS = 100000;
const KEY_LENGTH = 64;
const DIGEST = "sha512";

export function hashPassword(password: string): string {
  const salt = randomBytes(32).toString("hex");
  const hash = pbkdf2Sync(password, `${salt}:${PASSWORD_SECRET}`, ITERATIONS, KEY_LENGTH, DIGEST).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const verifyHash = pbkdf2Sync(password, `${salt}:${PASSWORD_SECRET}`, ITERATIONS, KEY_LENGTH, DIGEST).toString("hex");
  return hash === verifyHash;
}
