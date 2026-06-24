export function getErrorMessage(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object" && "message" in error) {
    const msg = (error as { message: unknown }).message;
    return typeof msg === "string" ? msg : "Something went wrong";
  }

  if (error && typeof error === "object" && "code" in error && "message" in error) {
    const err = error as { code: string; message: unknown };
    return typeof err.message === "string" ? err.message : "Something went wrong";
  }

  return "Something went wrong";
}