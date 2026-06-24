import { z, ZodError } from "zod";
import { ok, fail } from "../../../../../../../core/http/responses";
import { requireAdminProductsManage } from "../../../../authz";

const schema = z.object({
  kind: z.literal("image"),
  storageKey: z.string().trim().min(1),
  bucket: z.string().trim().min(1),
});

function toError(error: unknown) {
  if (error instanceof ZodError || error instanceof SyntaxError) {
    return Response.json(fail("INVALID_INPUT", "Invalid request body"), { status: 400 });
  }
  return Response.json(fail("INTERNAL_ERROR", "Internal server error"), { status: 500 });
}

export async function POST(request: Request) {
  const access = await requireAdminProductsManage();
  if (access.denied) return access.denied;

  try {
    const body = schema.parse(await request.json());
    const publicUrl = `/${body.storageKey}`;
    return Response.json(ok({ publicUrl, storageKey: body.storageKey, bucket: body.bucket }));
  } catch (error) {
    return toError(error);
  }
}