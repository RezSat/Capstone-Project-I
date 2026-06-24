import { fail } from "../http/responses";
import { API_ERROR_CODES } from "../../lib/constants";

type AuthErrorCode = typeof API_ERROR_CODES.UNAUTHORIZED | typeof API_ERROR_CODES.FORBIDDEN;

export class AuthError extends Error {
  code: AuthErrorCode;

  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

export function toUnauthorizedResponse(message = "Authentication required") {
  return Response.json(fail(API_ERROR_CODES.UNAUTHORIZED, message), { status: 401 });
}

export function toForbiddenResponse(message = "Forbidden") {
  return Response.json(fail(API_ERROR_CODES.FORBIDDEN, message), { status: 403 });
}
