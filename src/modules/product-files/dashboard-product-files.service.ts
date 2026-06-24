import type { ProductFileSummary } from "./product-file.types";
import { deleteProductFileMetadata, getProductFileListing, getPrivateFileAccessUrl } from "./product-file.service";

export type DashboardProductFileSummary = {
  id: string;
  kind: "image" | "document" | "video" | "other";
  access: "public" | "private";
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  publicUrl: string | null;
  isPrimary: boolean;
  createdAt: Date;
};

export type DashboardProductFileListing = {
  images: DashboardProductFileSummary[];
  documents: DashboardProductFileSummary[];
  primaryImage: DashboardProductFileSummary | null;
};

export function toDashboardProductFileSummary(file: ProductFileSummary): DashboardProductFileSummary {
  return {
    id: file.id,
    kind: file.kind,
    access: file.access,
    originalName: file.originalName,
    mimeType: file.mimeType,
    sizeBytes: file.sizeBytes,
    publicUrl: file.publicUrl,
    isPrimary: file.isPrimary,
    createdAt: file.createdAt,
  };
}

export async function getDashboardProductFileListing(
  productId: string
): Promise<DashboardProductFileListing> {
  const listing = await getProductFileListing(productId);
  return {
    images: listing.images.map(toDashboardProductFileSummary),
    documents: listing.documents.map(toDashboardProductFileSummary),
    primaryImage: listing.primaryImage ? toDashboardProductFileSummary(listing.primaryImage) : null,
  };
}

export async function getDashboardPrivateFileAccessUrl(
  fileId: string
): Promise<string> {
  return getPrivateFileAccessUrl(fileId);
}

export async function deleteDashboardProductFile(fileId: string): Promise<void> {
  await deleteProductFileMetadata(fileId);
}