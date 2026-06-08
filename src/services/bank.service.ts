import { db } from '@/lib/db'
import { createAuditLog } from './audit.service'
import type { BankAccountType, TransactionType } from '@prisma/client'

export async function getBankAccounts() {
  return db.bankAccount.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  })
}

export async function createBankAccount(params: {
  name: string
  accountNumber?: string
  bankName?: string
  branchName?: string
  type: BankAccountType
  initialBalance?: number
  userId: string
}) {
  const account = await db.bankAccount.create({
    data: {
      name: params.name,
      accountNumber: params.accountNumber,
      bankName: params.bankName,
      branchName: params.branchName,
      type: params.type,
      balance: params.initialBalance ?? 0,
    },
  })
  await createAuditLog({ 
    userId: params.userId, 
    action: 'CREATE', 
    module: 'BANKING', 
    recordId: account.id, 
    reference: account.name 
  })
  return account
}

export async function recordTransaction(params: {
  accountId: string
  type: TransactionType
  amount: number
  date: Date
  reference?: string
  description?: string
  userId: string
}) {
  return db.$transaction(async (tx) => {
    const transaction = await tx.bankTransaction.create({
      data: {
        accountId: params.accountId,
        type: params.type,
        amount: params.amount,
        date: params.date,
        reference: params.reference,
        description: params.description,
        createdBy: params.userId,
      },
    })

    const balanceChange = params.type === 'DEPOSIT' ? params.amount : -params.amount
    await tx.bankAccount.update({
      where: { id: params.accountId },
      data: { balance: { increment: balanceChange } },
    })

    await createAuditLog({ 
      userId: params.userId, 
      action: 'CREATE', 
      module: 'BANKING', 
      recordId: transaction.id, 
      reference: `Transaction ${params.type}` 
    })

    return transaction
  })
}

export async function reconcileTransaction(transactionId: string, userId: string) {
  const transaction = await db.bankTransaction.update({
    where: { id: transactionId },
    data: {
      isReconciled: true,
      reconciledAt: new Date(),
    },
  })
  await createAuditLog({ 
    userId, 
    action: 'UPDATE', 
    module: 'BANKING', 
    recordId: transactionId, 
    reference: 'Reconciliation' 
  })
  return transaction
}
