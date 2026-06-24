import { DEFAULT_SKU_PATTERN, type SkuMode } from "./settings.types";

export function getDefaultSkuMode(): SkuMode {
  return "manual";
}

export function getDefaultSkuPattern(): string {
  return DEFAULT_SKU_PATTERN;
}