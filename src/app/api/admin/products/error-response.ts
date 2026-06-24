import { ZodError } from "zod";
import { AppError } from "../../../../core/http/errors";
import { fail } from "../../../../core/http/responses";

export function adminProductsErrorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return Response.json(fail("INVALID_INPUT", error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("; ")), { status: 400 });
  }
  if (error instanceof SyntaxError) {
    return Response.json(fail("INVALID_INPUT", "Invalid request body"), { status: 400 });
  }
  if (error instanceof AppError) {
    const status = error.code === "NOT_FOUND" ? 404 : error.code === "CONFLICT" ? 409 : 500;
    return Response.json(fail(error.code, error.message), { status });
  }
  const message = error instanceof Error ? error.message : String(error);
  console.error("❌ adminProductsErrorResponse fell through:", message, error);
  return Response.json(fail("INTERNAL_ERROR", `Upload failed: ${message}`), { status: 500 });
}
