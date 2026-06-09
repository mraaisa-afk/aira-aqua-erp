import { db } from '@/lib/db'
import { generateNumber } from '@/lib/utils'
import { createAuditLog } from './audit.service'
import type { VoucherType } from '@prisma/client'

export async function getAccountHeads(type?: string) {
  return db.accountHead.findMany({
    where: { isActive: true, ...(type ? { type: type as any } : {}) },
    orderBy: { code: 'asc' },
  })
}

export async function createVoucher(params: {
  type: VoucherType
  date: Date
  description?: string
  entries: Array<{ accountHeadId: string; debit: number; credit: number; narration?: string }>
  userId: string
}) {
  const totalDebit  = params.entries.reduce((s, e) => s + e.debit,  0)
  const totalCredit = params.entries.reduce((s, e) => s + e.credit, 0)

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw new Error('ডেবিট ও ক্রেডিট সমান হতে হবে (ডাবল এন্ট্রি নিয়ম)')
  }

  const count = await db.voucher.count()
  const prefix = { JOURNAL: 'JV', RECEIPT: 'RV', PAYMENT: 'PV', EXPENSE: 'EXP' }[params.type]
  const voucherNo = generateNumber(prefix, count + 1)

  const voucher = await db.voucher.create({
    data: {
      voucherNo,
      type:        params.type,
      date:        params.date,
      description: params.description,
      totalDebit,
      totalCredit,
      createdBy:   params.userId,
      entries: { create: params.entries },
    },
    include: { entries: { include: { accountHead: true } } },
  })

  await createAuditLog({ userId: params.userId, action: 'CREATE', module: 'ACCOUNTING', recordId: voucher.id, reference: voucherNo })
  return voucher
}

export async function postVoucher(voucherId: string, userId: string) {
  const voucher = await db.voucher.findUnique({ where: { id: voucherId } })
  if (!voucher) throw new Error('ভাউচার পাওয়া যায়নি')
  if (voucher.status === 'POSTED') throw new Error('ভাউচার ইতিমধ্যে পোস্ট করা হয়েছে')

  const updated = await db.voucher.update({
    where: { id: voucherId },
    data: { status: 'POSTED', postedBy: userId, postedAt: new Date() },
  })
  await createAuditLog({ userId, action: 'POST', module: 'ACCOUNTING', recordId: voucherId, reference: voucher.voucherNo })
  return updated
}

export async function getVouchers(type?: string, status?: string) {
  return db.voucher.findMany({
    where: {
      ...(type   ? { type: type as any }     : {}),
      ...(status ? { status: status as any } : {}),
    },
    include: { entries: { include: { accountHead: true } } },
    orderBy: { date: 'desc' },
    take: 100,
  })
}

export async function getTrialBalance(fromDate: Date, toDate: Date) {
  const entries = await db.voucherEntry.findMany({
    where: { voucher: { status: 'POSTED', date: { gte: fromDate, lte: toDate } } },
    include: { accountHead: true },
  })

  const map = new Map<string, { name: string; code: string; type: string; debit: number; credit: number }>()
  for (const e of entries) {
    const key = e.accountHeadId
    const existing = map.get(key) ?? { name: e.accountHead.name, code: e.accountHead.code, type: e.accountHead.type, debit: 0, credit: 0 }
    existing.debit  += Number(e.debit)
    existing.credit += Number(e.credit)
    map.set(key, existing)
  }
  return Array.from(map.values()).sort((a, b) => a.code.localeCompare(b.code))
}

// Bangladesh VAT Calculation (Standard rate: 15%)
export function calculateVAT(amount: number, rate: number = 15): number {
  return (amount * rate) / 100
}

// Get outstanding receivables
export async function getOutstandingReceivables(customerId?: string) {
  return await db.accountsReceivable.findMany({
    where: {
      status: 'OUTSTANDING',
      ...(customerId && { customerId }),
    },
    include: {
      customer: true,
      invoice: true,
    },
    orderBy: {
      dueDate: 'asc',
    },
  })
}

// Get outstanding payables
export async function getOutstandingPayables(supplierId?: string) {
  return await db.accountsPayable.findMany({
    where: {
      status: 'OUTSTANDING',
      ...(supplierId && { supplierId }),
    },
    include: {
      supplier: true,
      bill: true,
    },
    orderBy: {
      dueDate: 'asc',
    },
  })
}

// Get general ledger balance for an account
export async function getAccountBalance(accountHeadId: string) {
  return await db.generalLedger.findUnique({
    where: { accountHeadId },
    include: {
      accountHead: true,
    },
  })
}

// Get all general ledger balances
export async function getGeneralLedger() {
  return await db.generalLedger.findMany({
    include: {
      accountHead: true,
    },
    orderBy: {
      accountHead: {
        code: 'asc',
      },
    },
  })
}
