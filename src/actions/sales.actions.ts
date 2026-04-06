'use server'
import { auth } from '@/lib/auth'
import { createSalesOrder, createInvoice, recordCollection } from '@/services/sales.service'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/types'

async function getUserId() {
  const session = await auth()
  if (!session?.user) throw new Error('অনুমতি নেই')
  return (session.user as any).id as string
}

export async function createSalesOrderAction(params: {
  customerId: string
  notes?: string
  items: Array<{ productId: string; quantity: number; unitPrice: number }>
}): Promise<ActionResult> {
  try {
    const userId = await getUserId()
    const so = await createSalesOrder({ ...params, userId })
    revalidatePath('/sales')
    return { success: true, data: so }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function createInvoiceAction(soId: string, dueDate?: string): Promise<ActionResult> {
  try {
    const userId = await getUserId()
    const invoice = await createInvoice({ soId, dueDate: dueDate ? new Date(dueDate) : undefined, userId })
    revalidatePath('/sales')
    return { success: true, data: invoice }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function recordCollectionAction(invoiceId: string, amount: number, reference?: string): Promise<ActionResult> {
  try {
    const userId = await getUserId()
    const collection = await recordCollection({ invoiceId, amount, reference, userId })
    revalidatePath('/sales')
    return { success: true, data: collection }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}
