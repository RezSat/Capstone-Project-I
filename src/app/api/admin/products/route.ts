import { ZodError } from "zod";
import { AppError } from "../../../../core/http/errors";
import { fail, ok } from "../../../../core/http/responses";
import { createDashboardCatalogProduct, listDashboardCatalogProducts } from "../../../../modules/products/admin-catalog.service";
import { requireAdminProductsManage, requireAdminProductsView } from "../authz";

function toError(error: unknown) {
  console.error("Product API Error:", error);
  if (error instanceof ZodError || error instanceof SyntaxError) return Response.json(fail("INVALID_INPUT", "Invalid request body"), { status: 400 });
  if (error instanceof AppError) return Response.json(fail(error.code, error.message), { status: error.code === "NOT_FOUND" ? 404 : error.code === "CONFLICT" ? 409 : 500 });
  return Response.json(fail("INTERNAL_ERROR", error instanceof Error ? error.message : "Internal server error"), { status: 500 });
}

export async function GET() {
  const access = await requireAdminProductsView();
  if (access.denied) return access.denied;
  try {
    return Response.json(ok(await listDashboardCatalogProducts()));
  } catch (error) {
    return toError(error);
  }
}

export async function POST(request: Request) {
  const access = await requireAdminProductsManage();
  if (access.denied) return access.denied;
  try {
    return Response.json(ok(await createDashboardCatalogProduct(await request.json(), access.actorUserId)), { status: 201 });
  } catch (error) {
    return toError(error);
  }
}
