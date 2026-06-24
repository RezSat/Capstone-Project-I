import { sql } from "drizzle-orm";
import { db } from "../../core/db/client";
import { auditLogs } from "../../core/db/schema";

export type AuditAction = string;

export type AuditLogInput = {
  actorId?: string;
  actorEmail?: string;
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
};

export async function createAuditLog(input: AuditLogInput) {
  const [log] = await db
    .insert(auditLogs)
    .values({
      actorUserId: input.actorId ?? null,
      actorEmail: input.actorEmail ?? null,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId ?? null,
      metadata: input.metadata ?? {},
    })
    .returning();

  return log;
}

export async function listAuditLogs(options?: {
  targetType?: string;
  targetId?: string;
  action?: string;
  limit?: number;
  offset?: number;
}) {
  const { targetType, targetId, action, limit = 50, offset = 0 } = options ?? {};

  const conditions = [];
  if (targetType) conditions.push(sql`${auditLogs.targetType} = ${targetType}`);
  if (targetId) conditions.push(sql`${auditLogs.targetId} = ${targetId}`);
  if (action) conditions.push(sql`${auditLogs.action} = ${action}`);

  return db
    .select()
    .from(auditLogs)
    .orderBy(sql`${auditLogs.createdAt} desc`)
    .limit(limit)
    .offset(offset);
}