import { db } from '@/lib/db'
import type { AuditAction } from '@prisma/client'

export interface AuditParams {
  userId: string
  action: AuditAction
  module: string
  recordId: string
  oldValue?: Record<string, unknown>
  newValue?: Record<string, unknown>
  reference?: string
}

export async function createAuditLog(params: AuditParams): Promise<void> {
  await db.auditLog.create({
    data: {
      userId:    params.userId,
      action:    params.action,
      module:    params.module,
      recordId:  params.recordId,
      oldValue:  params.oldValue ?? undefined,
      newValue:  params.newValue ?? undefined,
      reference: params.reference,
    },
  })
}

export async function getAuditLogs(module: string, recordId: string) {
  return db.auditLog.findMany({
    where: { module, recordId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
}
