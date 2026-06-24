import { ZodError } from "zod";
import { AppError } from "@/core/http/errors";
import { fail, ok } from "@/core/http/responses";
import { updateDashboardCategoryFilterOption, deleteDashboardCategoryFilterOption } from "@/modules/products/admin-catalog.service";
import { requireAdminProductsManage } from "@/app/api/admin/authz";

function toError(error: unknown) {
  if (error instanceof ZodError || error instanceof SyntaxError) return Response.json(fail("INVALID_INPUT", "Invalid request body"), { status: 400 });
  if (error instanceof AppError) return Response.json(fail(error.code, error.message), { status: error.code === "NOT_FOUND" ? 404 : error.code === "CONFLICT" ? 409 : 500 });
  return Response.json(fail("INTERNAL_ERROR", "Internal server error"), { status: 500 });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string; filterId: string; optionId: string }> }) {
  const access = await requireAdminProductsManage();
  if (access.denied) return access.denied;
  try {
    const { id, filterId, optionId } = await context.params;
    const actorUserId = access.actorUserId;
    return Response.json(ok(await updateDashboardCategoryFilterOption(id, filterId, optionId, await request.json(), actorUserId)));
  } catch (error) {
    return toError(error);
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string; filterId: string; optionId: string }> }) {
  const access = await requireAdminProductsManage();
  if (access.denied) return access.denied;
  try {
    const { id, filterId, optionId } = await context.params;
    const actorUserId = access.actorUserId;
    await deleteDashboardCategoryFilterOption(id, filterId, optionId, actorUserId);
    return Response.json(ok({ deleted: true }));
  } catch (error) {
    return toError(error);
  }
}