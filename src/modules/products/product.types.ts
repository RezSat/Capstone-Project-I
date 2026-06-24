export type ProductActivityFilter = "active" | "inactive" | "all";

export type Product = {
  id: string;
  name: string;
  slug: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductVariant = {
  id: string;
  productId: string;
  sku: string;
  title: string;
  priceMinor: number;
  status: string;
};

export type CreateProductInput = {
  name: string;
  sku?: string;
  priceMinor?: number;
  description?: string;
};

export type InsertProductInput = {
  name: string;
  sku?: string;
  priceMinor?: number;
};

export type UpdateProductInput = Partial<CreateProductInput>;

export type UpdateProductRecordInput = Partial<CreateProductInput>;