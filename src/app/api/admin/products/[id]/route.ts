import { ZodError } from "zod";
import { AppError } from "../../../../../core/http/errors";
import { fail, ok } from "../../../../../core/http/responses";
import { archiveDashboardCatalogProduct, getDashboardCatalogProduct, updateDashboardCatalogProduct } from "../../../../../modules/products/admin-catalog.service";
import { requireAdminProductsManage, requireAdminProductsView } from "../../authz";

function toError(error: unknown) {
  if (error instanceof ZodError) {
    console.error("400 ZodError validation failed:", JSON.stringify(error.issues, null, 2));
    return Response.json(fail("INVALID_INPUT", `Invalid request body: ${error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`), { status: 400 });
  }
  if (error instanceof SyntaxError) return Response.json(fail("INVALID_INPUT", "Invalid JSON in request body"), { status: 400 });
  if (error instanceof AppError) {
    console.error(`AppError ${error.code}:`, error.message);
    return Response.json(fail(error.code, error.message), { status: error.code === "NOT_FOUND" ? 404 : error.code === "CONFLICT" ? 409 : 500 });
  }
  console.error("500 Internal error:", error instanceof Error ? error.message : String(error));
  return Response.json(fail("INTERNAL_ERROR", "Internal server error"), { status: 500 });
}

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const access = await requireAdminProductsView();
  if (access.denied) return access.denied;
  try {
    return Response.json(ok(await getDashboardCatalogProduct((await context.params).id)));
  } catch (error) {
    return toError(error);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await requireAdminProductsManage();
  if (access.denied) return access.denied;
  try {
    return Response.json(ok(await updateDashboardCatalogProduct((await context.params).id, await request.json(), access.actorUserId)));
  } catch (error) {
    return toError(error);
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const access = await requireAdminProductsManage();
  if (access.denied) return access.denied;
  try {
    return Response.json(ok(await archiveDashboardCatalogProduct((await context.params).id, access.actorUserId)));
  } catch (error) {
    return toError(error);
  }
}
