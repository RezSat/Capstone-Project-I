import { ZodError } from "zod";
import { AppError } from "@/core/http/errors";
import { fail, ok } from "@/core/http/responses";
import { createDashboardCategoryFilterOption, listDashboardCategoryFilterOptions } from "@/modules/products/admin-catalog.service";
import { requireAdminProductsManage, requireAdminProductsView } from "@/app/api/admin/authz";

function toError(error: unknown) {
  if (error instanceof ZodError || error instanceof SyntaxError) return Response.json(fail("INVALID_INPUT", "Invalid request body"), { status: 400 });
  if (error instanceof AppError) return Response.json(fail(error.code, error.message), { status: error.code === "NOT_FOUND" ? 404 : error.code === "CONFLICT" ? 409 : 500 });
  return Response.json(fail("INTERNAL_ERROR", "Internal server error"), { status: 500 });
}

export async function GET(request: Request, context: { params: Promise<{ id: string; filterId: string }> }) {
  const access = await requireAdminProductsView();
  if (access.denied) return access.denied;
  try {
    return Response.json(ok(await listDashboardCategoryFilterOptions((await context.params).filterId)));
  } catch (error) {
    return toError(error);
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string; filterId: string }> }) {
  const access = await requireAdminProductsManage();
  if (access.denied) return access.denied;
  try {
    const { id, filterId } = await context.params;
    const actorUserId = access.actorUserId;
    return Response.json(ok(await createDashboardCategoryFilterOption(id, filterId, await request.json(), actorUserId)), { status: 201 });
  } catch (error) {
    return toError(error);
  }
}