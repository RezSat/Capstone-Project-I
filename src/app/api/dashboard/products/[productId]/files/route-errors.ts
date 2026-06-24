import { ZodError } from "zod";
import { AppError } from "../../../../../../core/http/errors";
import { fail } from "../../../../../../core/http/responses";
import { API_ERROR_CODES } from "../../../../../../lib/constants";

/** Maps an error code to an HTTP status number. */
function statusForCode(code: string): number {
  if (code === API_ERROR_CODES.NOT_FOUND) return 404;
  if (code === API_ERROR_CODES.CONFLICT) return 409;
  if (code === API_ERROR_CODES.INVALID_INPUT) return 400;
  if (code === API_ERROR_CODES.UNAUTHORIZED) return 401;
  return 500;
}

/** Converts a caught error into a standard JSON error response. */
export function productFilesErrorResponse(error: unknown): Response {
  if (error instanceof ZodError || error instanceof SyntaxError) {
    return Response.json(fail(API_ERROR_CODES.INVALID_INPUT, "Invalid request body"), { status: 400 });
  }

  if (error instanceof AppError) {
    return Response.json(fail(error.code, error.message), { status: statusForCode(error.code) });
  }

  return Response.json(fail("INTERNAL_ERROR", "Internal server error"), { status: 500 });
}
