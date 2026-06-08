import { db } from '@/lib/db'
import { generateNumber } from '@/lib/utils'
import { createAuditLog } from './audit.service'
import type { ExpenseStatus } from '@prisma/client'

export async function getExpenseCategories() {
  return db.expenseCategory.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  })
}

export async function createExpenseClaim(params: {
  categoryId: string
  amount: number
  date: Date
  description?: string
  receiptUrl?: string
  userId: string
}) {
  const count = await db.expenseClaim.count()
  const claimNumber = generateNumber('EXP', count + 1)
  const claim = await db.expenseClaim.create({
    data: {
      claimNumber,
      categoryId: params.categoryId,
      amount: params.amount,
      date: params.date,
      description: params.description,
      receiptUrl: params.receiptUrl,
      claimedBy: params.userId,
      status: 'SUBMITTED',
    },
  })
  await createAuditLog({ 
    userId: params.userId, 
    action: 'CREATE', 
    module: 'EXPENSE', 
    recordId: claim.id, 
    reference: claimNumber 
  })
  return claim
}

export async function approveExpenseClaim(claimId: string, userId: string) {
  const claim = await db.expenseClaim.update({
    where: { id: claimId },
    data: {
      status: 'APPROVED',
      approvedBy: userId,
      approvedAt: new Date(),
    },
  })
  await createAuditLog({ 
    userId, 
    action: 'APPROVE', 
    module: 'EXPENSE', 
    recordId: claimId, 
    reference: claim.claimNumber 
  })
  return claim
}

export async function rejectExpenseClaim(claimId: string, userId: string) {
  const claim = await db.expenseClaim.update({
    where: { id: claimId },
    data: {
      status: 'REJECTED',
      approvedBy: userId,
      approvedAt: new Date(),
    },
  })
  await createAuditLog({ 
    userId, 
    action: 'REJECT', 
    module: 'EXPENSE', 
    recordId: claimId, 
    reference: claim.claimNumber 
  })
  return claim
}

export async function markExpenseAsPaid(claimId: string, userId: string) {
  const claim = await db.expenseClaim.update({
    where: { id: claimId },
    data: { status: 'PAID' },
  })
  await createAuditLog({ 
    userId, 
    action: 'UPDATE', 
    module: 'EXPENSE', 
    recordId: claimId, 
    reference: `${claim.claimNumber} - PAID` 
  })
  return claim
}
