import { db } from "@/lib/db";
import { AuditAction } from "@prisma/client";
import { headers } from "next/headers";

export interface AuditLogInput {
  userId: string;
  action: AuditAction;
  module: string;
  recordId: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  reference?: string;
}

export async function logAudit(input: AuditLogInput): Promise<void> {
  try {
    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for")?.split(",")[0].trim() ||
      headersList.get("x-real-ip") ||
      "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    await db.auditLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        module: input.module,
        recordId: input.recordId,
        oldValue: input.oldValue || null,
        newValue: input.newValue || null,
        reference: input.reference || null,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error("Failed to log audit:", error);
  }
}

export async function getAuditLogs(
  filters?: {
    userId?: string;
    module?: string;
    action?: AuditAction;
    recordId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }
) {
  const limit = filters?.limit || 50;
  const offset = filters?.offset || 0;

  const where: any = {};

  if (filters?.userId) where.userId = filters.userId;
  if (filters?.module) where.module = filters.module;
  if (filters?.action) where.action = filters.action;
  if (filters?.recordId) where.recordId = filters.recordId;

  if (filters?.startDate || filters?.endDate) {
    where.createdAt = {};
    if (filters.startDate) where.createdAt.gte = filters.startDate;
    if (filters.endDate) where.createdAt.lte = filters.endDate;
  }

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    }),
    db.auditLog.count({ where }),
  ]);

  return {
    logs,
    total,
    limit,
    offset,
  };
}
