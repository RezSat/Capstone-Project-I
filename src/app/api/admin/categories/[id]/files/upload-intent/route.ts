import { z, ZodError } from "zod";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { randomBytes } from "crypto";
import { ok, fail } from "../../../../../../../core/http/responses";
import { AppError } from "../../../../../../../core/http/errors";
import { requireAdminProductsManage } from "../../../../authz";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE_BYTES,
} from "../../../../../../../modules/product-files/product-file.validation";

const schema = z.object({
  kind: z.literal("image"),
  fileName: z.string().trim().min(1),
  mimeType: z.enum(ALLOWED_IMAGE_MIME_TYPES),
  sizeBytes: z.number().int().positive().max(MAX_IMAGE_SIZE_BYTES),
});

function toError(error: unknown) {
  if (error instanceof ZodError || error instanceof SyntaxError) {
    return Response.json(fail("INVALID_INPUT", "Invalid request body"), { status: 400 });
  }
  if (error instanceof AppError) {
    return Response.json(fail(error.code, error.message), { status: 400 });
  }
  return Response.json(fail("INTERNAL_ERROR", "Internal server error"), { status: 500 });
}

function sanitizeFileName(originalName: string): string {
  const name = originalName.toLowerCase().replace(/[^a-z0-9.]/g, "-");
  const hash = randomBytes(4).toString("hex");
  const ext = name.split(".").pop() ?? "";
  const base = name.replace(`.${ext}`, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return `${base}-${hash}.${ext}`;
}

function ensureLocalDir(categoryId: string): string {
  const dir = join(process.cwd(), "public", "uploads", "categories", categoryId, "images");
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await requireAdminProductsManage();
  if (access.denied) return access.denied;

  try {
    const { id } = await context.params;
    const body = schema.parse(await request.json());
    const safeName = sanitizeFileName(body.fileName);
    const storageKey = `uploads/categories/${id}/images/${safeName}`;
    const dir = ensureLocalDir(id);
    const localPath = join(dir, safeName);
    const placeholderBuffer = Buffer.from("");
    writeFileSync(localPath, placeholderBuffer);
    return Response.json(ok({ uploadUrl: `/api/admin/categories/${id}/files/upload?key=${encodeURIComponent(storageKey)}`, storageKey, bucket: "local" }));
  } catch (error) {
    return toError(error);
  }
}