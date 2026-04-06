'use server'
import { auth } from '@/lib/auth'
import { adjustStock, transferStock } from '@/services/inventory.service'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/types'

async function getUserId() {
  const session = await auth()
  if (!session?.user) throw new Error('অনুমতি নেই')
  return (session.user as any).id as string
}

export async function adjustStockAction(params: {
  productId: string
  warehouseId: string
  batchNo: string
  quantity: number
  reason: string
}): Promise<ActionResult> {
  try {
    const userId = await getUserId()
    const result = await adjustStock({ ...params, userId })
    revalidatePath('/inventory')
    return { success: true, data: result }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function transferStockAction(params: {
  fromWarehouseId: string
  toWarehouseId: string
  productId: string
  batchNo: string
  quantity: number
  notes?: string
}): Promise<ActionResult> {
  try {
    const userId = await getUserId()
    const result = await transferStock({ ...params, userId })
    revalidatePath('/inventory')
    return { success: true, data: result }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}
