import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
const bootstrapModule = await import("../src/modules/auth/super-admin-bootstrap");
const bootstrapFirstSuperAdmin =
  (bootstrapModule as { bootstrapFirstSuperAdmin?: unknown }).bootstrapFirstSuperAdmin ??
  (bootstrapModule as { default?: { bootstrapFirstSuperAdmin?: unknown } }).default?.bootstrapFirstSuperAdmin;

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required env: ${name}`);
  return value;
}

async function main() {
  if (typeof bootstrapFirstSuperAdmin !== "function") {
    throw new Error("bootstrapFirstSuperAdmin export not found");
  }
  const result = await (bootstrapFirstSuperAdmin as (input: {
    email: string;
    password: string;
    fullName: string;
  }) => Promise<{ userId: string; role: string }> )({
    email: required("BOOTSTRAP_SUPER_ADMIN_EMAIL"),
    password: required("BOOTSTRAP_SUPER_ADMIN_PASSWORD"),
    fullName: required("BOOTSTRAP_SUPER_ADMIN_NAME"),
  });
  console.info(`Super admin created: user=${result.userId} role=${result.role}`);
  process.exit(0);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Bootstrap failed: ${message}`);
  process.exit(1);
});
