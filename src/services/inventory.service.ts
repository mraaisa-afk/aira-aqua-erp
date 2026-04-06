import { db } from '@/lib/db'
import { createAuditLog } from './audit.service'

export async function getCurrentStock(warehouseId?: string, productId?: string) {
  return db.stock.findMany({
    where: {
      ...(warehouseId ? { warehouseId } : {}),
      ...(productId   ? { productId }   : {}),
      quantity: { gt: 0 },
    },
    include: { product: { include: { unit: true, category: true } }, warehouse: true },
    orderBy: { product: { name: 'asc' } },
  })
}

export async function getLowStockItems() {
  const stocks = await db.stock.findMany({
    include: { product: { include: { unit: true } }, warehouse: true },
  })
  return stocks.filter(s => Number(s.quantity) <= s.product.minStockLevel)
}

export async function adjustStock(params: {
  productId: string
  warehouseId: string
  batchNo: string
  quantity: number
  reason: string
  userId: string
}) {
  const { productId, warehouseId, batchNo, quantity, reason, userId } = params

  const result = await db.$transaction(async (tx) => {
    const existing = await tx.stock.findUnique({
      where: { productId_warehouseId_batchNo: { productId, warehouseId, batchNo } },
    })
    const newQty = Number(existing?.quantity ?? 0) + quantity
    if (newQty < 0) throw new Error('রিজার্ভ স্টক শূন্যের নিচে যাবে না')

    const stock = await tx.stock.upsert({
      where: { productId_warehouseId_batchNo: { productId, warehouseId, batchNo } },
      create: { productId, warehouseId, batchNo, quantity: newQty },
      update: { quantity: newQty },
    })
    await tx.stockAdjustment.create({
      data: { productId, warehouseId, batchNo, quantity, reason, adjustedBy: userId },
    })
    return stock
  })

  await createAuditLog({ userId, action: 'UPDATE', module: 'INVENTORY', recordId: result.id, reference: reason })
  return result
}

export async function transferStock(params: {
  fromWarehouseId: string
  toWarehouseId: string
  productId: string
  batchNo: string
  quantity: number
  userId: string
  notes?: string
}) {
  const { fromWarehouseId, toWarehouseId, productId, batchNo, quantity, userId, notes } = params

  return db.$transaction(async (tx) => {
    const source = await tx.stock.findUnique({
      where: { productId_warehouseId_batchNo: { productId, warehouseId: fromWarehouseId, batchNo } },
    })
    if (!source || Number(source.quantity) < quantity) {
      throw new Error('প্রয়োজনীয় পরিমাণ মজুদ নেই')
    }
    await tx.stock.update({
      where: { productId_warehouseId_batchNo: { productId, warehouseId: fromWarehouseId, batchNo } },
      data: { quantity: { decrement: quantity } },
    })
    await tx.stock.upsert({
      where: { productId_warehouseId_batchNo: { productId, warehouseId: toWarehouseId, batchNo } },
      create: { productId, warehouseId: toWarehouseId, batchNo, quantity },
      update: { quantity: { increment: quantity } },
    })
    return tx.stockTransfer.create({
      data: { fromWarehouseId, toWarehouseId, productId, batchNo, quantity, transferredBy: userId, notes },
    })
  })
}
