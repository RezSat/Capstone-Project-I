export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const ALLOWED_DOCUMENT_MIME_TYPES = [
  "application/pdf",
] as const;

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_DOCUMENT_SIZE_BYTES = 50 * 1024 * 1024;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];
export type AllowedDocumentMimeType = (typeof ALLOWED_DOCUMENT_MIME_TYPES)[number];

export function isAllowedImageMimeType(mimeType: string): mimeType is AllowedImageMimeType {
  return ALLOWED_IMAGE_MIME_TYPES.includes(mimeType as AllowedImageMimeType);
}

export function isAllowedDocumentMimeType(mimeType: string): mimeType is AllowedDocumentMimeType {
  return ALLOWED_DOCUMENT_MIME_TYPES.includes(mimeType as AllowedDocumentMimeType);
}

export function getMaxSizeForKind(kind: "image" | "document"): number {
  return kind === "image" ? MAX_IMAGE_SIZE_BYTES : MAX_DOCUMENT_SIZE_BYTES;
}

export function validateFileKindAndMimeType(kind: "image" | "document", mimeType: string): void {
  if (kind === "image") {
    if (!isAllowedImageMimeType(mimeType)) {
      throw new Error(`Invalid image MIME type: ${mimeType}. Allowed: ${ALLOWED_IMAGE_MIME_TYPES.join(", ")}`);
    }
  } else {
    if (!isAllowedDocumentMimeType(mimeType)) {
      throw new Error(`Invalid document MIME type: ${mimeType}. Allowed: ${ALLOWED_DOCUMENT_MIME_TYPES.join(", ")}`);
    }
  }
}

export function validateFileSize(kind: "image" | "document", sizeBytes: number): void {
  const maxSize = getMaxSizeForKind(kind);
  if (sizeBytes <= 0) {
    throw new Error("File size must be greater than 0");
  }
  if (sizeBytes > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    throw new Error(`File size exceeds maximum allowed (${maxSizeMB}MB)`);
  }
}