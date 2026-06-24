import {
  SETTING_KEYS,
  type SettingKey,
} from "./settings.types";

export { SETTING_KEYS };

const DEFAULT_VALUES: Record<string, unknown> = {
  [SETTING_KEYS.DEFAULT_LOW_STOCK_THRESHOLD]: 10,
  [SETTING_KEYS.FILE_UPLOAD_SIZE_LIMIT]: 5,
  [SETTING_KEYS.ALLOWED_UPLOAD_TYPES]: "image/jpeg,image/png,image/webp,application/pdf",
  [SETTING_KEYS.PUBLIC_IMAGE_MODE]: false,
  [SETTING_KEYS.STOCK_ADJUSTMENT_NOTE_REQUIRED]: true,
};

export function getSettingDefault(key: SettingKey): unknown {
  return DEFAULT_VALUES[key] ?? null;
}

export function parseLowStockThreshold(value: unknown): number {
  if (typeof value === "number") return Math.max(0, value);
  if (typeof value === "string") {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 10 : Math.max(0, parsed);
  }
  return 10;
}

export function parseFileSizeLimit(value: unknown): number {
  if (typeof value === "number") return Math.max(1, Math.min(100, value));
  if (typeof value === "string") {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 5 : Math.max(1, Math.min(100, parsed));
  }
  return 5;
}

export function parseUploadTypes(value: unknown): string[] {
  if (typeof value === "string") {
    return value.split(",").map((t) => t.trim()).filter(Boolean);
  }
  return ["image/jpeg", "image/png", "image/webp", "application/pdf"];
}

export function parseBoolean(value: unknown, defaultValue = false): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }
  return defaultValue;
}

export function isPublicImageMode(value: unknown): boolean {
  return parseBoolean(value, false);
}

export function isStockNoteRequired(value: unknown): boolean {
  return parseBoolean(value, true);
}