import { eq } from "drizzle-orm";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { randomBytes } from "crypto";
import { ok, fail } from "@/core/http/responses";
import { requireAdminProductsManage } from "../../../admin/authz";
import { db } from "@/core/db/client";
import { files as filesTable } from "@/core/db/schema";
import { categories } from "@/core/db/schema/catalog";
import { ALLOWED_IMAGE_MIME_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/modules/product-files/product-file.validation";

const MAX_FILE_SIZE_BYTES = MAX_IMAGE_SIZE_BYTES;

function sanitizeFileName(originalName: string): string {
  const name = originalName.toLowerCase().replace(/[^a-z0-9.]/g, "-");
  const hash = randomBytes(4).toString("hex");
  const ext = name.split(".").pop() ?? "";
  const base = name.replace(`.${ext}`, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return `${base}-${hash}.${ext}`;
}

function ensureLocalDir(categoryId: string): string {
  const dir = join(process.cwd(), "public", "uploads", "categories", categoryId);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export async function POST(request: Request) {
  const access = await requireAdminProductsManage();
  if (access.denied) return access.denied;

  try {
    const formData = await request.formData();
    const categoryId = formData.get("categoryId") as string | null;
    const rawFile = formData.get("file") as File | null;

    if (!categoryId?.trim()) {
      return Response.json(fail("INVALID_INPUT", "categoryId is required"), { status: 400 });
    }

    if (!rawFile) {
      return Response.json(fail("INVALID_INPUT", "File is required"), { status: 400 });
    }

    if (!(rawFile instanceof File)) {
      return Response.json(fail("INVALID_INPUT", "Invalid file format"), { status: 400 });
    }

    if (rawFile.size === 0) {
      return Response.json(fail("INVALID_INPUT", "File is empty"), { status: 400 });
    }

    if (rawFile.size > MAX_FILE_SIZE_BYTES) {
      return Response.json(
        fail("INVALID_INPUT", `File exceeds ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB limit`),
        { status: 400 }
      );
    }

    const mimeType = rawFile.type;
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(mimeType as typeof ALLOWED_IMAGE_MIME_TYPES[number])) {
      return Response.json(
        fail("INVALID_INPUT", `Invalid file type. Allowed: ${ALLOWED_IMAGE_MIME_TYPES.join(", ")}`),
        { status: 400 }
      );
    }

    let buffer: Buffer;
    try {
      const arrayBuffer = await rawFile.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } catch {
      return Response.json(fail("INVALID_INPUT", "Failed to read file"), { status: 400 });
    }

    const safeName = sanitizeFileName(rawFile.name);
    const relativePath = `/uploads/categories/${categoryId}/${safeName}`;
    const storageKey = `uploads/categories/${categoryId}/${safeName}`;

    try {
      const dir = ensureLocalDir(categoryId);
      const filePath = join(dir, safeName);
      writeFileSync(filePath, buffer);
    } catch (storageError) {
      console.error("Storage write failed:", storageError);
      return Response.json(fail("INTERNAL_ERROR", "Failed to save file"), { status: 500 });
    }

    const fileId = crypto.randomUUID();

    try {
      const [insertedFile] = await db.insert(filesTable).values({
        id: fileId,
        kind: "image",
        access: "public",
        originalName: rawFile.name,
        mimeType: rawFile.type,
        sizeBytes: rawFile.size,
        bucket: "local",
        storageKey,
        publicUrl: relativePath,
      }).returning();

      await db.update(categories)
        .set({ imageFileId: insertedFile.id })
        .where(eq(categories.id, categoryId));

      return Response.json(ok({ fileId: insertedFile.id, publicUrl: relativePath }));
    } catch (dbError) {
      console.error("DB insert failed:", dbError);
      return Response.json(fail("INTERNAL_ERROR", "Failed to record file metadata"), { status: 500 });
    }
  } catch (error) {
    console.error("Upload route error:", error);
    return Response.json(fail("INTERNAL_ERROR", "Internal server error"), { status: 500 });
  }
}
