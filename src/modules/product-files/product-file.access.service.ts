import { AppError } from "../../core/http/errors";
import { API_ERROR_CODES } from "../../lib/constants";
import { findActiveProductFileById } from "./product-file.repo";

export async function getPrivateFileAccessUrl(fileId: string): Promise<string> {
  const file = await findActiveProductFileById(fileId);

  if (!file) {
    throw new AppError(API_ERROR_CODES.NOT_FOUND, "Product file not found");
  }

  if (file.access !== "private") {
    throw new AppError(API_ERROR_CODES.CONFLICT, "File is not private; use publicUrl instead");
  }

  return `/${file.storageKey}`;
}