import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { AppError } from "@/core/http/errors";
import { fail, ok } from "@/core/http/responses";
import { API_ERROR_CODES } from "@/lib/constants";
import { getDashboardAuth } from "@/modules/auth/dashboard-auth.service";
import { adjustInventory } from "@/modules/inventory/inventory.service";
import { adjustInventorySchema } from "@/modules/inventory/inventory.schema";

function statusForErrorCode(code: string) {
  if (code === API_ERROR_CODES.NOT_FOUND) {
    return 404;
  }
  if (code === API_ERROR_CODES.CONFLICT) {
    return 409;
  }
  return 500;
}

function errorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return Response.json(fail(API_ERROR_CODES.INVALID_INPUT, "Invalid request body"), { status: 400 });
  }
  if (error instanceof AppError) {
    return Response.json(fail(error.code, error.message), { status: statusForErrorCode(error.code) });
  }
  return Response.json(fail("INTERNAL_ERROR", "Internal server error"), { status: 500 });
}

export async function POST(request: Request) {
  const auth = await getDashboardAuth();
  if (!auth.isAuthenticated) {
    return Response.json(fail(API_ERROR_CODES.UNAUTHORIZED, "Dashboard authentication is required"), {
      status: 401,
    });
  }

  try {
    const body = await request.json();
    const parsed = adjustInventorySchema.parse(body);
    const item = await adjustInventory(parsed);
    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard");
    return Response.json(ok(item));
  } catch (error) {
    return errorResponse(error);
  }
}