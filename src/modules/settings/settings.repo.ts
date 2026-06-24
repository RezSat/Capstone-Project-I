import { eq } from "drizzle-orm";
import { db } from "../../core/db/client";
import { systemSettings } from "../../core/db/schema";

export function listSystemSettings() {
  return db.select().from(systemSettings).orderBy(systemSettings.key);
}

export function findSystemSettingByKey(key: string) {
  return db.query.systemSettings.findFirst({
    where: eq(systemSettings.key, key),
  });
}

export function upsertSystemSetting(key: string, value: Record<string, unknown>, description?: string) {
  return db
    .insert(systemSettings)
    .values({
      key,
      value,
      description: description ?? null,
    })
    .onConflictDoUpdate({
      target: systemSettings.key,
      set: {
        value,
        updatedAt: new Date(),
      },
    })
    .returning();
}