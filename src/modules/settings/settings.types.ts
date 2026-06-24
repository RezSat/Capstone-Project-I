import { z } from "zod";

export const SETTING_KEYS = {
  FREE_SHIPPING_THRESHOLD: "free_shipping_threshold",
  SKU_MODE: "sku_mode",
  SKU_PATTERN: "sku_pattern",
  DEFAULT_LOW_STOCK_THRESHOLD: "default_low_stock_threshold",
  ENABLE_PUBLIC_PRODUCT_VIEW: "enable_public_product_view",
  ENABLE_API_ACCESS: "enable_api_access",
  FILE_UPLOAD_SIZE_LIMIT: "file_upload_size_limit",
  ALLOWED_UPLOAD_TYPES: "allowed_upload_types",
  PUBLIC_IMAGE_MODE: "public_image_mode",
  STOCK_ADJUSTMENT_NOTE_REQUIRED: "stock_adjustment_note_required",
} as const;

export type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];

export type SkuMode = "manual" | "auto";

export const SKU_MODE_VALUES: SkuMode[] = ["manual", "auto"];

export const DEFAULT_SKU_PATTERN = "SKU-{NUMBER:4}";

export const SETTING_DESCRIPTIONS: Record<SettingKey, string> = {
  [SETTING_KEYS.FREE_SHIPPING_THRESHOLD]: "Minimum order subtotal in minor units (e.g. 650000 = LKR 6,500) to qualify for free delivery",
  [SETTING_KEYS.SKU_MODE]: "SKU generation mode: 'manual' requires user input, 'auto' generates automatically",
  [SETTING_KEYS.SKU_PATTERN]: "Pattern for auto-generated SKUs. Use {NUMBER:4} for sequential number (e.g., SKU-0001)",
  [SETTING_KEYS.DEFAULT_LOW_STOCK_THRESHOLD]: "Default threshold for low stock warnings on new products",
  [SETTING_KEYS.ENABLE_PUBLIC_PRODUCT_VIEW]: "Allow public (non-authenticated) access to view products",
  [SETTING_KEYS.ENABLE_API_ACCESS]: "Enable external API access with API keys",
  [SETTING_KEYS.FILE_UPLOAD_SIZE_LIMIT]: "Maximum file upload size in MB",
  [SETTING_KEYS.ALLOWED_UPLOAD_TYPES]: "Allowed file MIME types (comma-separated)",
  [SETTING_KEYS.PUBLIC_IMAGE_MODE]: "Allow public access to product images without auth",
  [SETTING_KEYS.STOCK_ADJUSTMENT_NOTE_REQUIRED]: "Require a note when adjusting stock levels",
};

export const updateSettingSchema = z.object({
  key: z.enum(["sku_mode", "sku_pattern", "default_low_stock_threshold", "enable_public_product_view", "enable_api_access", "file_upload_size_limit", "allowed_upload_types", "public_image_mode", "stock_adjustment_note_required"]),
  value: z.union([z.string(), z.number(), z.boolean()]),
});

export type UpdateSettingInput = z.infer<typeof updateSettingSchema>;

export type SystemSetting = {
  id: string;
  key: string;
  value: unknown;
  description: string | null;
  isPublic: boolean;
  updatedAt: Date;
};

export type SystemSettingsData = {
  items: SystemSetting[];
  status: "ready" | "error";
  isEmpty: boolean;
};