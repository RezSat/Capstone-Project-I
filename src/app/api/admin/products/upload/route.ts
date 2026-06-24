import { and, eq } from "drizzle-orm";
import { ok } from "@/core/http/responses";
import { fail } from "@/core/http/responses";
import { requireAdminProductsManage } from "../../../admin/authz";
import { adminProductsErrorResponse } from "../error-response";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { randomBytes } from "crypto";
import { db } from "@/core/db/client";
import { files as filesTable } from "@/core/db/schema";
import { productMedia } from "@/core/db/schema/products";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

function sanitizeFileName(originalName: string): string {
  const name = originalName.toLowerCase().replace(/[^a-z0-9.]/g, "-");
  const hash = randomBytes(4).toString("hex");
  const ext = name.split(".").pop() ?? "";
  const base = name.replace(`.${ext}`, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return `${base}-${hash}.${ext}`;
}

function getLocalStorageDir(productId: string): string {
  return join(process.cwd(), "public", "uploads", "products", productId, "images");
}

function ensureLocalDir(productId: string): string {
  const dir = getLocalStorageDir(productId);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export async function POST(request: Request) {
  const access = await requireAdminProductsManage();
  if (access.denied) return access.denied;

  let productId: string | null = null;

  try {
    const formData = await request.formData();
    productId = formData.get("productId") as string | null;

    if (!productId?.trim()) {
      return Response.json(fail("INVALID_INPUT", "productId is required"), { status: 400 });
    }

    const rawFiles = formData.getAll("files");
    if (!rawFiles.length) {
      return Response.json(fail("INVALID_INPUT", "At least one file is required"), { status: 400 });
    }

    const results: string[] = [];

    const existingPrimary = await db.select()
      .from(productMedia)
      .where(and(eq(productMedia.productId, productId), eq(productMedia.isPrimary, true)));

    const determinePrimaryStatus = existingPrimary.length === 0;

    for (let i = 0; i < rawFiles.length; i++) {
      const rawFile = rawFiles[i];

      if (!(rawFile instanceof File)) {
        console.error(`Upload: item ${i} is not a File instance:`, typeof rawFile);
        continue;
      }

      const file: File = rawFile;

      if (file.size === 0) {
        console.warn(`Upload: skipping empty file ${file.name}`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        return Response.json(
          fail("INVALID_INPUT", `File ${file.name} exceeds 10MB limit`),
          { status: 400 }
        );
      }

      let buffer: Buffer;
      try {
        const arrayBuffer = await file.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      } catch (bufError) {
        console.error(`Buffer conversion failed for ${file.name}:`, bufError);
        return Response.json(
          fail("INVALID_INPUT", `Failed to read file ${file.name}`),
          { status: 400 }
        );
      }

      const safeName = sanitizeFileName(file.name);
      const relativePath = `/uploads/products/${productId}/images/${safeName}`;
      const fileId = crypto.randomUUID();
      const storageKey = `uploads/products/${productId}/images/${safeName}`;

      try {
        const dir = ensureLocalDir(productId);
        const filePath = join(dir, safeName);
        writeFileSync(filePath, buffer);
      } catch (storageError) {
        console.error(`Storage write failed for ${file.name}:`, storageError);
        return Response.json(
          fail("INTERNAL_ERROR", `Failed to save file ${file.name}`),
          { status: 500 }
        );
      }

      try {
        await db.insert(filesTable).values({
          id: fileId,
          kind: "image",
          access: "public",
          originalName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          bucket: "local",
          storageKey,
          publicUrl: relativePath,
        }).returning();

        await db.insert(productMedia).values({
          productId,
          fileId,
          role: "gallery",
          altText: null,
          isPrimary: i === 0 && determinePrimaryStatus,
          sortOrder: i,
        });
      } catch (dbError) {
        console.error(`DB insert failed for ${file.name}:`, dbError);
        return Response.json(
          fail("INTERNAL_ERROR", `Failed to record file ${file.name}`),
          { status: 500 }
        );
      }

      results.push(relativePath);
    }

    if (!results.length) {
      return Response.json(fail("INVALID_INPUT", "No valid files could be processed"), { status: 400 });
    }

    return Response.json(ok(results));
  } catch (error) {
    console.error("CRITICAL UPLOAD ROUTE CRASH:", error);
    return adminProductsErrorResponse(error);
  }
}
