import { ZodError } from "zod";
import { AppError } from "@/core/http/errors";
import { fail, ok } from "@/core/http/responses";
import { getDashboardCategoryFiltersWithOptions } from "@/modules/products/admin-catalog.service";
import { requireAdminProductsView } from "@/app/api/admin/authz";

function toError(error: unknown) {
  if (error instanceof ZodError || error instanceof SyntaxError) return Response.json(fail("INVALID_INPUT", "Invalid request body"), { status: 400 });
  if (error instanceof AppError) return Response.json(fail(error.code, error.message), { status: error.code === "NOT_FOUND" ? 404 : 500 });
  return Response.json(fail("INTERNAL_ERROR", "Internal server error"), { status: 500 });
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await requireAdminProductsView();
  if (access.denied) return access.denied;
  try {
    return Response.json(ok(await getDashboardCategoryFiltersWithOptions((await context.params).id)));
  } catch (error) {
    return toError(error);
  }
}