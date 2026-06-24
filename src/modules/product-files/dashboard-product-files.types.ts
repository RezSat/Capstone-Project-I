/**
 * Dashboard-facing types for the product file upload flows (images and documents).
 */

export type DashboardUploadImageInput = {
  productId: string;
  file: File;
};

export type DashboardUploadImageResult = {
  isSuccess: boolean;
  message: string;
};

export type DashboardUploadDocumentInput = {
  productId: string;
  file: File;
};

export type DashboardUploadDocumentResult = {
  isSuccess: boolean;
  message: string;
};
