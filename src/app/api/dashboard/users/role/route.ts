import { AppError } from "@/core/http/errors";
import { fail, ok } from "@/core/http/responses";
import { updateDashboardUserRoleService } from "@/modules/users/dashboard-users.service";
import { requireStaffManageAccess } from "../authz";

export async function POST(request: Request) {
  const access = await requireStaffManageAccess();
  if (access.denied) return access.denied;
  try {
    const input = await request.json();
    const result = await updateDashboardUserRoleService(input);
    if (!result.isSuccess) {
      return Response.json(fail(result.error.code, result.error.message), { status: 400 });
    }
    return Response.json(ok(result.data));
  } catch (error) {
    if (error instanceof AppError) {
      return Response.json(fail(error.code, error.message), { status: 500 });
    }
    return Response.json(fail("INTERNAL_ERROR", "Internal server error"), { status: 500 });
  }
}
