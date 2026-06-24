export type ProductFileKind = "image" | "document" | "video" | "other";
export type ProductFileAccess = "public" | "private";

export type ProductFile = {
  id: string;
  productId: string;
  kind: ProductFileKind;
  access: ProductFileAccess;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  bucket: string;
  storageKey: string;
  publicUrl: string | null;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: Date;
  deletedAt: Date | null;
};

export type CreateProductFileInput = {
  productId: string;
  kind: ProductFileKind;
  access?: ProductFileAccess;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  bucket: string;
  storageKey: string;
  publicUrl?: string;
  isPrimary?: boolean;
  sortOrder?: number;
};

export type InsertProductFileInput = {
  id: string;
  productId: string;
  kind: ProductFileKind;
  access: ProductFileAccess;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  bucket: string;
  storageKey: string;
  publicUrl: string | null;
  isPrimary: boolean;
  sortOrder: number;
};

export type ListProductFilesInput = {
  productId: string;
  includeDeleted?: boolean;
};

export type UploadIntentInput = {
  productId: string;
  kind: ProductFileKind;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
};

export type ProductFileSummary = {
  id: string;
  productId: string;
  kind: ProductFileKind;
  access: ProductFileAccess;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  publicUrl: string | null;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: Date;
};

export type ProductFileListing = {
  images: ProductFileSummary[];
  documents: ProductFileSummary[];
  primaryImage: ProductFileSummary | null;
};