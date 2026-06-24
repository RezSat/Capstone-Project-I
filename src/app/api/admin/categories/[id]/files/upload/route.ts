import { ok, fail } from "../../../../../../../core/http/responses";
import { requireAdminProductsManage } from "../../../../authz";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await requireAdminProductsManage();
  if (access.denied) return access.denied;

  try {
    const { id } = await context.params;
    const url = new URL(request.url);
    const storageKey = url.searchParams.get("key");

    if (!storageKey) {
      return Response.json(fail("INVALID_INPUT", "Storage key is required"), { status: 400 });
    }

    let buffer: Buffer;
    try {
      const arrayBuffer = await request.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } catch {
      return Response.json(fail("INVALID_INPUT", "Failed to read file"), { status: 400 });
    }

    const keyParts = storageKey.split("/");
    const fileName = keyParts[keyParts.length - 1];
    const dir = join(process.cwd(), "public", "uploads", "categories", id, "images");
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    const filePath = join(dir, fileName);
    writeFileSync(filePath, buffer);

    return Response.json(ok({ success: true }));
  } catch (error) {
    console.error("Upload error:", error);
    return Response.json(fail("INTERNAL_ERROR", "Failed to save file"), { status: 500 });
  }
}
