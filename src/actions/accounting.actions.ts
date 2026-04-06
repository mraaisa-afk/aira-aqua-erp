'use server'
import { auth } from '@/lib/auth'
import { createVoucher, postVoucher } from '@/services/accounting.service'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/types'
import type { VoucherType } from '@/types'

async function getUserId() {
  const session = await auth()
  if (!session?.user) throw new Error('অনুমতি নেই')
  return (session.user as any).id as string
}

export async function createVoucherAction(params: {
  type: string
  date: string
  description?: string
  entries: Array<{ accountHeadId: string; debit: number; credit: number; narration?: string }>
}): Promise<ActionResult> {
  try {
    const userId = await getUserId()
    const voucher = await createVoucher({ ...params, type: params.type as any, date: new Date(params.date), userId })
    revalidatePath('/accounting')
    return { success: true, data: voucher }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function postVoucherAction(voucherId: string): Promise<ActionResult> {
  try {
    const userId = await getUserId()
    const voucher = await postVoucher(voucherId, userId)
    revalidatePath('/accounting')
    return { success: true, data: voucher }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}
