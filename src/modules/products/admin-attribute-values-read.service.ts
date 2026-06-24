import { AppError } from "../../core/http/errors";
import { getAttributeById, listValuesByAttribute } from "./admin-variants.repo";

export async function listProductAttributeValues(productId: string, attributeId: string) {
  const attribute = await getAttributeById(productId, attributeId);
  if (!attribute) throw new AppError("NOT_FOUND", "Attribute not found");
  return listValuesByAttribute(attributeId);
}
