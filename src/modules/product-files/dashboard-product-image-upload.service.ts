import type { DashboardUploadImageInput, DashboardUploadImageResult } from "./dashboard-product-files.types";

export type UploadImageOptions = {
  makePublic?: boolean;
};

/**
 * Orchestrates the two-step product image upload flow from the browser:
 * 1. POST the file to the dashboard API which writes to local storage.
 * 2. POST finalize to save metadata in the database.
 */
export async function uploadDashboardProductImage(
  input: DashboardUploadImageInput,
  options: UploadImageOptions = {}
): Promise<DashboardUploadImageResult> {
  const { productId, file } = input;
  const { makePublic = false } = options;

  const uploadFormData = new FormData();
  uploadFormData.append("file", file);
  uploadFormData.append("kind", "image");

  const uploadRes = await fetch(`/api/dashboard/products/${productId}/files/upload-intent`, {
    method: "POST",
    body: uploadFormData,
  });
  const uploadBody = await uploadRes.json().catch(() => null);

  if (!uploadRes.ok || !uploadBody?.success) {
    const errorMsg = uploadBody?.error?.message || "Could not upload file. Please try again.";
    return { isSuccess: false, message: errorMsg };
  }

  const { storageKey, bucket, publicUrl } = uploadBody.data;
  const access = makePublic ? "public" : "private";

  const finalizeRes = await fetch(`/api/dashboard/products/${productId}/files/finalize`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      kind: "image",
      access,
      originalName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      bucket,
      storageKey,
      publicUrl,
      isPrimary: false,
    }),
  });
  const finalizeBody = await finalizeRes.json().catch(() => null);

  if (!finalizeRes.ok || !finalizeBody?.success) {
    return { isSuccess: false, message: "Upload succeeded but metadata could not be saved." };
  }

  return { isSuccess: true, message: "Image uploaded successfully." };
}
