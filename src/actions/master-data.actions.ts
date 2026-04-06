'use server'
import { auth } from '@/lib/auth'
import { productSchema, supplierSchema, customerSchema } from '@/lib/validations/product'
import { createProduct, updateProduct, createSupplier, updateSupplier, createCustomer, updateCustomer } from '@/services/master-data.service'
import { createAuditLog } from '@/services/audit.service'
import { revalidatePath } from 'next/cache'
import type { ActionResult } from '@/types'

async function getSession() {
  const session = await auth()
  if (!session?.user) throw new Error('অনুমতি নেই')
  return session
}

export async function createProductAction(formData: unknown): Promise<ActionResult> {
  try {
    const session = await getSession()
    const data = productSchema.parse(formData)
    const product = await createProduct(data)
    await createAuditLog({ userId: (session.user as any).id, action: 'CREATE', module: 'MASTER_DATA', recordId: product.id, newValue: data as any })
    revalidatePath('/master-data')
    return { success: true, data: product }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function updateProductAction(id: string, formData: unknown): Promise<ActionResult> {
  try {
    const session = await getSession()
    const data = productSchema.partial().parse(formData)
    const product = await updateProduct(id, data)
    await createAuditLog({ userId: (session.user as any).id, action: 'UPDATE', module: 'MASTER_DATA', recordId: id })
    revalidatePath('/master-data')
    return { success: true, data: product }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function createSupplierAction(formData: unknown): Promise<ActionResult> {
  try {
    await getSession()
    const data = supplierSchema.parse(formData)
    const supplier = await createSupplier(data)
    revalidatePath('/master-data')
    return { success: true, data: supplier }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

export async function createCustomerAction(formData: unknown): Promise<ActionResult> {
  try {
    await getSession()
    const data = customerSchema.parse(formData)
    const customer = await createCustomer(data)
    revalidatePath('/master-data')
    return { success: true, data: customer }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}
