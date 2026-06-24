import { AppError } from "../../core/http/errors";
import { createId } from "../../core/utils/ids";
import {
  findProductById,
  insertProductWithInventory,
  listProducts,
  searchProductsPaginated,
  updateProductById,
  bulkUpdateProductActiveState,
  type ProductSearchParams,
} from "./product.repo";
import type { CreateProductInput, ProductActivityFilter } from "./product.types";

export function validateCreateProduct(input: unknown) {
  const parsed = input as CreateProductInput;
  if (!parsed.name || parsed.name.trim() === "") {
    throw new AppError("INVALID_INPUT", "Product name is required");
  }
  return parsed;
}

export async function createProduct(input: CreateProductInput) {
  const parsedInput = validateCreateProduct(input);

  const variantId = createId();
  const locationId = createId();

  return insertProductWithInventory(
    {
      name: parsedInput.name,
      sku: parsedInput.sku,
      priceMinor: parsedInput.priceMinor,
    },
    variantId,
    locationId
  );
}

export function validateUpdateProduct(input: unknown) {
  return validateCreateProduct(input);
}

export async function updateProduct(productId: string, input: CreateProductInput) {
  const existingProduct = await findProductById(productId);
  if (!existingProduct) {
    throw new AppError("NOT_FOUND", "Product not found");
  }

  const updateData = {
    name: input.name ?? existingProduct.name,
  };

  const updatedProduct = await updateProductById(productId, updateData);

  if (!updatedProduct) {
    throw new AppError("CONFLICT", "Product changed during update");
  }

  return updatedProduct;
}

export function getProducts(activityFilter: ProductActivityFilter = "active") {
  return listProducts(activityFilter);
}

export function findProducts(params: ProductSearchParams) {
  return searchProductsPaginated(params);
}

export function findProductsPaginated(params: ProductSearchParams) {
  return searchProductsPaginated(params);
}

export async function bulkActivateProducts(productIds: string[]) {
  return bulkUpdateProductActiveState(productIds, true);
}

export async function bulkDeactivateProducts(productIds: string[]) {
  return bulkUpdateProductActiveState(productIds, false);
}

export function normalizeProductActivityFilter(
  value: string | string[] | null | undefined
): ProductActivityFilter {
  const resolvedValue = Array.isArray(value) ? value[0] : value;

  if (resolvedValue === "all" || resolvedValue === "inactive" || resolvedValue === "active") {
    return resolvedValue;
  }

  return "active";
}