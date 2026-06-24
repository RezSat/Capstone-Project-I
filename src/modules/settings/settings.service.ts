import { AppError } from "../../core/http/errors";
import { listSystemSettings, upsertSystemSetting } from "./settings.repo";
import { updateSettingSchema, SETTING_DESCRIPTIONS, SETTING_KEYS as KEYS } from "./settings.types";
import type { SystemSettingsData, SystemSetting } from "./settings.types";

export async function listSystemSettingsService(): Promise<SystemSettingsData> {
  try {
    const settings = await listSystemSettings();
    return {
      items: settings as SystemSetting[],
      status: "ready",
      isEmpty: settings.length === 0,
    };
  } catch {
    return {
      items: [],
      status: "error",
      isEmpty: true,
    };
  }
}

export async function updateSystemSettingService(input: unknown) {
  const parsed = updateSettingSchema.safeParse(input);
  if (!parsed.success) {
    return { isSuccess: false as const, error: new AppError("INVALID_INPUT", parsed.error.issues[0]?.message ?? "Invalid input") };
  }

  const description = SETTING_DESCRIPTIONS[parsed.data.key as keyof typeof SETTING_DESCRIPTIONS];
  const valueJson: Record<string, unknown> = { value: parsed.data.value };

  try {
    const [updated] = await upsertSystemSetting(parsed.data.key, valueJson, description);
    return { isSuccess: true as const, data: updated as SystemSetting };
  } catch {
    return { isSuccess: false as const, error: new AppError("UPDATE_FAILED", "Failed to update setting") };
  }
}

export function getSettingKey(key: string): string | undefined {
  const validKeys = Object.values(KEYS);
  return validKeys.includes(key as typeof validKeys[number]) ? key : undefined;
}