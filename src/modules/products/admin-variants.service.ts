import { AppError } from "../../core/http/errors";
import { createAuditLog } from "../audit/audit.service";
import { getSettingDefault, parseLowStockThreshold } from "../settings/operational-settings";
import { createAttributeSchema, createAttributeValueSchema, createVariantSchema, generateVariantsSchema, updateAttributeSchema, updateAttributeValueSchema, updateVariantSchema } from "./admin-variants.schema";
import { createAttribute, createAttributeValue, createInventoryForVariant, createVariant, deleteAttribute, deleteVariant, findInventoryByVariantId, getAttributeById, getAttributeBySlug, getDefaultStockLocation, getProductById, getValueById, getValueByValue, getVariantById, getVariantBySignature, getVariantBySku, listAttributesByProduct, listValuesByAttribute, listVariantsByProductWithOptions, updateAttribute, updateAttributeValue, updateVariant, upsertVariantOptions } from "./admin-variants.repo";

const signatureFrom = (parts: string[]) => parts.sort().join("|");
const skuFrom = (slug: string, values: string[]) => `${slug}-${values.map((v) => v.toLowerCase().replace(/\s+/g, "-")).join("-")}`.slice(0, 120);
const cartesian = (groups: string[][]): string[][] => groups.reduce<string[][]>((acc, group) => acc.flatMap((a) => group.map((v) => [...a, v])), [[]]);

async function requireProduct(productId: string) {
  const product = await getProductById(productId);
  if (!product) throw new AppError("NOT_FOUND", "Product not found");
  return product;
}

export async function listProductAttributes(productId: string) {
  await requireProduct(productId);
  return listAttributesByProduct(productId);
}

export async function createProductAttribute(productId: string, input: unknown, actorUserId?: string) {
  await requireProduct(productId);
  const parsed = createAttributeSchema.parse(input);
  if (await getAttributeBySlug(productId, parsed.slug)) throw new AppError("CONFLICT", "Attribute slug already exists");
  const created = await createAttribute({ ...parsed, productId });
  if (!created) throw new AppError("INTERNAL_ERROR", "Failed to create attribute");
  await createAuditLog({ actorId: actorUserId, action: "product.attribute.create", targetType: "product_attribute", targetId: created.id });
  return created;
}

export async function updateProductAttribute(productId: string, attributeId: string, input: unknown, actorUserId?: string) {
  await requireProduct(productId);
  const existing = await getAttributeById(productId, attributeId);
  if (!existing) throw new AppError("NOT_FOUND", "Attribute not found");
  const parsed = updateAttributeSchema.parse(input);
  if (parsed.slug && (await getAttributeBySlug(productId, parsed.slug, attributeId))) throw new AppError("CONFLICT", "Attribute slug already exists");
  const updated = await updateAttribute(attributeId, parsed.isActive === false ? { ...parsed, isVariantAttribute: false } : parsed);
  if (!updated) throw new AppError("CONFLICT", "Attribute changed during update");
  await createAuditLog({ actorId: actorUserId, action: "product.attribute.update", targetType: "product_attribute", targetId: updated.id });
  return updated;
}

export async function deleteProductAttribute(productId: string, attributeId: string, actorUserId?: string) {
  await requireProduct(productId);
  const existing = await getAttributeById(productId, attributeId);
  if (!existing) throw new AppError("NOT_FOUND", "Attribute not found");
  const deleted = await deleteAttribute(attributeId);
  if (!deleted) throw new AppError("INTERNAL_ERROR", "Failed to delete attribute");
  await createAuditLog({ actorId: actorUserId, action: "product.attribute.delete", targetType: "product_attribute", targetId: attributeId });
  return { success: true };
}

export async function createProductAttributeValue(productId: string, attributeId: string, input: unknown, actorUserId?: string) {
  const attribute = await getAttributeById(productId, attributeId);
  if (!attribute) throw new AppError("NOT_FOUND", "Attribute not found");
  const parsed = createAttributeValueSchema.parse(input);
  if (await getValueByValue(attributeId, parsed.value)) throw new AppError("CONFLICT", "Attribute value already exists");
  const created = await createAttributeValue({ ...parsed, colorHex: parsed.colorHex ?? null, imageFileId: parsed.imageFileId ?? null, attributeId });
  if (!created) throw new AppError("INTERNAL_ERROR", "Failed to create attribute value");
  await createAuditLog({ actorId: actorUserId, action: "product.attribute_value.create", targetType: "product_attribute_value", targetId: created.id });
  return created;
}

export async function updateProductAttributeValue(productId: string, attributeId: string, valueId: string, input: unknown, actorUserId?: string) {
  const attribute = await getAttributeById(productId, attributeId);
  if (!attribute) throw new AppError("NOT_FOUND", "Attribute not found");
  const existing = await getValueById(attributeId, valueId);
  if (!existing) throw new AppError("NOT_FOUND", "Attribute value not found");
  const parsed = updateAttributeValueSchema.parse(input);
  if (parsed.value && (await getValueByValue(attributeId, parsed.value, valueId))) throw new AppError("CONFLICT", "Attribute value already exists");
  const updated = await updateAttributeValue(valueId, parsed);
  if (!updated) throw new AppError("CONFLICT", "Attribute value changed during update");
  await createAuditLog({ actorId: actorUserId, action: "product.attribute_value.update", targetType: "product_attribute_value", targetId: updated.id });
  return updated;
}

export async function listProductVariants(productId: string) {
  await requireProduct(productId);
  return listVariantsByProductWithOptions(productId);
}

export async function createProductVariant(productId: string, input: unknown, actorUserId?: string) {
  const product = await requireProduct(productId);
  const parsed = createVariantSchema.parse(input);
  if (await getVariantBySku(parsed.sku)) throw new AppError("CONFLICT", "Variant SKU already exists");
  if (await getVariantBySignature(productId, parsed.optionSignature)) throw new AppError("CONFLICT", "Variant combination already exists");
  const created = await createVariant({ ...parsed, productId, barcode: parsed.barcode ?? null, compareAtPriceMinor: parsed.compareAtPriceMinor ?? null, costPriceMinor: parsed.costPriceMinor ?? null, currencyCode: product.currencyCode });
  if (!created) throw new AppError("INTERNAL_ERROR", "Failed to create variant");
  await upsertVariantOptions(created.id, await mapValuePairs(productId, parsed.attributeValueIds));
  
  const existingInventory = await findInventoryByVariantId(created.id);
  if (!existingInventory) {
    const location = await getDefaultStockLocation();
    if (location) {
      const defaultThreshold = parseLowStockThreshold(getSettingDefault("default_low_stock_threshold"));
      await createInventoryForVariant({
        variantId: created.id,
        locationId: location.id,
        quantityOnHand: parsed.initialStockQuantity ?? 0,
        quantityReserved: 0,
        lowStockThreshold: parsed.lowStockThreshold ?? defaultThreshold,
      });
    }
  }
  
  await createAuditLog({ actorId: actorUserId, action: "product.variant.create", targetType: "product_variant", targetId: created.id });
  return created;
}

export async function updateProductVariant(productId: string, variantId: string, input: unknown, actorUserId?: string) {
  await requireProduct(productId);
  const existing = await getVariantById(productId, variantId);
  if (!existing) throw new AppError("NOT_FOUND", "Variant not found");
  const parsed = updateVariantSchema.parse(input);
  if (parsed.sku && (await getVariantBySku(parsed.sku, variantId))) throw new AppError("CONFLICT", "Variant SKU already exists");
  if (parsed.optionSignature && (await getVariantBySignature(productId, parsed.optionSignature))) throw new AppError("CONFLICT", "Variant combination already exists");
  const updated = await updateVariant(variantId, parsed);
  if (!updated) throw new AppError("CONFLICT", "Variant changed during update");
  if (parsed.attributeValueIds) await upsertVariantOptions(variantId, await mapValuePairs(productId, parsed.attributeValueIds));
  await createAuditLog({ actorId: actorUserId, action: "product.variant.update", targetType: "product_variant", targetId: updated.id });
  return updated;
}

export async function deleteProductVariant(productId: string, variantId: string, actorUserId?: string) {
  await requireProduct(productId);
  const existing = await getVariantById(productId, variantId);
  if (!existing) throw new AppError("NOT_FOUND", "Variant not found");
  const deleted = await deleteVariant(variantId);
  if (!deleted) throw new AppError("INTERNAL_ERROR", "Failed to delete variant");
  await createAuditLog({ actorId: actorUserId, action: "product.variant.delete", targetType: "product_variant", targetId: variantId });
  return { success: true };
}

export async function generateProductVariants(productId: string, input: unknown, actorUserId?: string) {
  const product = await requireProduct(productId);
  const parsed = generateVariantsSchema.parse(input);
  const valueLabels = await loadValueLabels(productId);
  const combos = cartesian(parsed.attributes.map((a) => a.valueIds));
  const created: string[] = []; const skipped: string[] = [];
  const location = await getDefaultStockLocation();
  const defaultThreshold = parseLowStockThreshold(getSettingDefault("default_low_stock_threshold"));
  for (const combo of combos) {
    const signature = signatureFrom(combo);
    if (await getVariantBySignature(productId, signature)) { skipped.push(signature); continue; }
    const labels = combo.map((id) => valueLabels[id] ?? id);
    const sku = skuFrom(product.slug, labels);
    if (await getVariantBySku(sku)) { skipped.push(signature); continue; }
    const variant = await createVariant({ productId, sku, title: `${product.name} ${labels.join(" /")}`, optionSignature: signature, priceMinor: parsed.basePriceMinor ?? product.basePriceMinor, currencyCode: product.currencyCode, status: "active" });
    if (!variant) { skipped.push(signature); continue; }
    await upsertVariantOptions(variant.id, await mapValuePairs(productId, combo));
    if (location) {
      const existingInventory = await findInventoryByVariantId(variant.id);
      if (!existingInventory) {
        await createInventoryForVariant({
          variantId: variant.id,
          locationId: location.id,
          quantityOnHand: 0,
          quantityReserved: 0,
          lowStockThreshold: defaultThreshold,
        });
      }
    }
    created.push(variant.id);
  }
  await createAuditLog({ actorId: actorUserId, action: "product.variant.generate", targetType: "product", targetId: productId, metadata: { created: created.length, skipped: skipped.length } });
  return { createdVariantIds: created, skippedSignatures: skipped };
}

async function mapValuePairs(productId: string, valueIds: string[]) {
  const attributes = await listAttributesByProduct(productId);
  const valuesByAttribute = await Promise.all(attributes.map((a) => listValuesByAttribute(a.id)));
  const pairs: Array<{ attributeId: string; attributeValueId: string }> = [];
  for (const group of valuesByAttribute) for (const value of group) if (valueIds.includes(value.id)) pairs.push({ attributeId: value.attributeId, attributeValueId: value.id });
  return pairs;
}

async function loadValueLabels(productId: string) {
  const labels: Record<string, string> = {};
  const attributes = await listAttributesByProduct(productId);
  for (const attr of attributes) for (const value of await listValuesByAttribute(attr.id)) labels[value.id] = value.value;
  return labels;
}
