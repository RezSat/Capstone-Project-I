import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { ok } from "../../../../../../../core/http/responses";
import { API_ERROR_CODES } from "../../../../../../../lib/constants";
import { fail } from "../../../../../../../core/http/responses";
import { getDashboardAuth } from "../../../../../../../modules/auth/dashboard-auth.service";
import { createUploadIntent } from "../../../../../../../modules/product-files/product-file.service";
import { productFilesErrorResponse } from "../route-errors";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/** POST /api/dashboard/products/[productId]/files/upload-intent
 *  Accepts a file upload via FormData, writes to local storage, returns storage metadata.
 */
export async function POST(
  request: Request,
  context: { params: Promise<{ productId: string }> }
) {
  const auth = await getDashboardAuth();
  if (!auth.isAuthenticated) {
    return Response.json(fail(API_ERROR_CODES.UNAUTHORIZED, "Dashboard authentication is required"), { status: 401 });
  }

  try {
    const { productId } = await context.params;
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const kind = (formData.get("kind") as string) || "image";

    if (!file || !(file instanceof File)) {
      return Response.json(fail(API_ERROR_CODES.INVALID_INPUT, "File is required"), { status: 400 });
    }

    if (file.size === 0) {
      return Response.json(fail(API_ERROR_CODES.INVALID_INPUT, "File is empty"), { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return Response.json(fail(API_ERROR_CODES.INVALID_INPUT, "File exceeds 10MB limit"), { status: 400 });
    }

    const intent = createUploadIntent({
      productId,
      kind: kind as "image" | "document" | "video" | "other",
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    });

    const dir = join(process.cwd(), intent.storageKey);
    const dirPath = join(process.cwd(), ...intent.storageKey.split("/").slice(0, -1));
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    writeFileSync(dir, buffer);

    return Response.json(ok({
      storageKey: intent.storageKey,
      bucket: intent.bucket,
      publicUrl: `/${intent.storageKey}`,
    }));
  } catch (error) {
    return productFilesErrorResponse(error);
  }
}
