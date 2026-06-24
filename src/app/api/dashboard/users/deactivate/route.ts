import { ZodError } from "zod";
import { AppError } from "@/core/http/errors";
import { fail, ok } from "@/core/http/responses";
import { toggleDashboardUserActiveService } from "@/modules/users/dashboard-users.service";
import { requireStaffManageAccess } from "../authz";

function errorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return Response.json(fail("INVALID_INPUT", "Invalid request body"), { status: 400 });
  }
  if (error instanceof AppError) {
    return Response.json(fail(error.code, error.message), { status: 500 });
  }
  return Response.json(fail("INTERNAL_ERROR", "Internal server error"), { status: 500 });
}

export async function POST(request: Request) {
  const access = await requireStaffManageAccess();
  if (access.denied) return access.denied;

  try {
    const input = await request.json();
    const result = await toggleDashboardUserActiveService({ userId: input.userId, isActive: false });

    if (!result.isSuccess) {
      return Response.json(fail(result.error.code, result.error.message), { status: 400 });
    }

    return Response.json(ok(result.data));
  } catch (error) {
    return errorResponse(error);
  }
}
