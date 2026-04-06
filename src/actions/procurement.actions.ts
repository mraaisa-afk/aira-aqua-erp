'use server'
import { auth } from '@/lib/auth'
import { createPurchaseOrder, receiveGRN } from '@/services/procurement.service'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/types'

async function getUserId() {
  const session = await auth()
  if (!session?.user) throw new Error('অনুমতি নেই')
  return (session.user as any).id as string
}

export async function createPurchaseOrderAction(params: {
  supplierId: string
  expectedDate?: string
  notes?: string
  items: Array<{ productId: string; quantity: number; unitPrice: number }>
}): Promise<ActionResult> {
  try {
    const userId = await getUserId()
    const po = await createPurchaseOrder({ ...params, expectedDate: params.expectedDate ? new Date(params.expectedDate) : undefined, userId })
    revalidatePath('/procurement')
    return { success: true, data: po }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function receiveGRNAction(params: {
  poId: string
  warehouseId: string
  notes?: string
  items: Array<{ productId: string; batchNo: string; quantity: number; unitPrice: number }>
}): Promise<ActionResult> {
  try {
    const userId = await getUserId()
    const grn = await receiveGRN({ ...params, userId })
    revalidatePath('/procurement')
    revalidatePath('/inventory')
    return { success: true, data: grn }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}
