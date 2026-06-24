export type ProductFileKind = "image" | "document" | "video" | "other";
export type ProductFileAccess = "public" | "private";

export type ProductImageMedia = {
  id: string;
  productId: string;
  variantId: string | null;
  role: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: Date;
};

export type ProductImage = ProductImageMedia & {
  fileId: string;
  file: {
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

export type ProductImageSummary = {
  id: string;
  mediaId: string;
  productId: string;
  variantId: string | null;
  role: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
  fileId: string;
  kind: string;
  access: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  publicUrl: string | null;
  createdAt: Date;
};

export type ProductImageListing = {
  images: ProductImageSummary[];
  primaryImage: ProductImageSummary | null;
  imageCount: number;
};

export type CreateProductImageInput = {
  productId: string;
  variantId?: string;
  fileId: string;
  role?: string;
  altText?: string;
  isPrimary?: boolean;
  sortOrder?: number;
};

export type UpdateProductImageInput = {
  altText?: string | null;
  isPrimary?: boolean;
  sortOrder?: number;
};

export type VariantImageSummary = {
  id: string;
  mediaId: string;
  variantId: string;
  role: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
  fileId: string;
  kind: string;
  access: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  publicUrl: string | null;
  createdAt: Date;
};

export type VariantImageListing = {
  images: VariantImageSummary[];
  primaryImage: VariantImageSummary | null;
  imageCount: number;
};

export type CreateVariantImageInput = {
  variantId: string;
  fileId: string;
  role?: string;
  altText?: string;
  isPrimary?: boolean;
  sortOrder?: number;
};