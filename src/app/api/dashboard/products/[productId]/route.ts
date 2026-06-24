import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { AppError } from "../../../../../core/http/errors";
import { fail, ok } from "../../../../../core/http/responses";
import { API_ERROR_CODES } from "../../../../../lib/constants";
import { getDashboardAuth } from "../../../../../modules/auth/dashboard-auth.service";
import { updateProduct } from "../../../../../modules/products/product.service";

function statusForErrorCode(code: string) {
  if (code === API_ERROR_CODES.CONFLICT) {
    return 409;
  }

  if (code === API_ERROR_CODES.INVALID_INPUT) {
    return 400;
  }

  if (code === API_ERROR_CODES.NOT_FOUND) {
    return 404;
  }

  return 500;
}

function errorResponse(error: unknown) {
  if (error instanceof ZodError || error instanceof SyntaxError) {
    return Response.json(fail(API_ERROR_CODES.INVALID_INPUT, "Invalid request body"), { status: 400 });
  }

  if (error instanceof AppError) {
    return Response.json(fail(error.code, error.message), { status: statusForErrorCode(error.code) });
  }

  return Response.json(fail("INTERNAL_ERROR", "Internal server error"), { status: 500 });
}

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ productId: string }>;
  }
) {
  const auth = await getDashboardAuth();
  if (!auth.isAuthenticated) {
    return Response.json(fail(API_ERROR_CODES.UNAUTHORIZED, "Dashboard authentication is required"), {
      status: 401,
    });
  }

  try {
    const { productId } = await context.params;
    const input = await request.json();
    const product = await updateProduct(productId, input);
    try {
      revalidatePath("/dashboard/products");
    } catch {
    }
    return Response.json(ok(product));
  } catch (error) {
    return errorResponse(error);
  }
}
