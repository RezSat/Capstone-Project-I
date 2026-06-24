export type UploadCategoryImageInput = {
  categoryId: string;
  file: File;
};

export type UploadCategoryImageResult = {
  isSuccess: boolean;
  message: string;
};

export async function uploadDashboardCategoryImage(
  input: UploadCategoryImageInput
): Promise<UploadCategoryImageResult> {
  const { categoryId, file } = input;

  const formData = new FormData();
  formData.append("categoryId", categoryId);
  formData.append("file", file);

  try {
    const response = await fetch("/api/admin/categories/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.success) {
      const errorMsg = data?.error?.message || "Upload failed. Please try again.";
      return { isSuccess: false, message: errorMsg };
    }

    return { isSuccess: true, message: "Category image uploaded successfully." };
  } catch (error) {
    console.error("Category image upload error:", error);
    return { isSuccess: false, message: "Network error. Check your connection." };
  }
}
