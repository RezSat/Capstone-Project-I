import type { ProductFileSummary, ProductFileListing } from "./product-file.types";

type ProductFileRow = {
  pm: {
    id: string;
    productId: string;
    fileId: string;
    role: string;
    altText: string | null;
    isPrimary: boolean;
    sortOrder: number;
    createdAt: Date;
  };
  f: {
    id: string;
    kind: string;
    access: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    width: number | null;
    height: number | null;
    publicUrl: string | null;
    deletedAt: Date | null;
    createdAt: Date;
  };
};

export function toProductFileSummary(row: ProductFileRow): ProductFileSummary {
  return {
    id: row.f.id,
    productId: row.pm.productId,
    kind: row.f.kind as ProductFileSummary["kind"],
    access: row.f.access as ProductFileSummary["access"],
    originalName: row.f.originalName,
    mimeType: row.f.mimeType,
    sizeBytes: row.f.sizeBytes,
    publicUrl: row.f.publicUrl,
    isPrimary: row.pm.isPrimary,
    sortOrder: row.pm.sortOrder,
    createdAt: row.f.createdAt,
  };
}

export function toProductFileListing(rows: ProductFileRow[]): ProductFileListing {
  const activeFiles = rows.filter((r) => r.f.deletedAt === null);
  const images = activeFiles.filter((r) => r.f.kind === "image").map(toProductFileSummary);
  const documents = activeFiles.filter((r) => r.f.kind === "document").map(toProductFileSummary);
  const primaryImage = images.find((f) => f.isPrimary) ?? null;

  return { images, documents, primaryImage };
}