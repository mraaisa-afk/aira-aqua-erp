import { db } from '@/lib/db'
import { generateNumber } from '@/lib/utils'
import { createAuditLog } from './audit.service'

export async function getPurchaseOrders(status?: string) {
  return db.purchaseOrder.findMany({
    where: status ? { status: status as any } : undefined,
    include: { supplier: true, items: { include: { product: true } }, _count: { select: { grns: true } } },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getPurchaseOrderById(id: string) {
  return db.purchaseOrder.findUnique({
    where: { id },
    include: { supplier: true, items: { include: { product: { include: { unit: true } } } }, grns: true, bills: true },
  })
}

export async function createPurchaseOrder(params: {
  supplierId: string
  expectedDate?: Date
  notes?: string
  items: Array<{ productId: string; quantity: number; unitPrice: number }>
  userId: string
}) {
  const count = await db.purchaseOrder.count()
  const poNumber = generateNumber('PO', count + 1)
  const totalAmount = params.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)

  const po = await db.purchaseOrder.create({
    data: {
      poNumber,
      supplierId:   params.supplierId,
      expectedDate: params.expectedDate,
      notes:        params.notes,
      totalAmount,
      createdBy:    params.userId,
      items: {
        create: params.items.map(i => ({
          productId: i.productId,
          quantity:  i.quantity,
          unitPrice: i.unitPrice,
        })),
      },
    },
    include: { items: true },
  })

  await createAuditLog({ userId: params.userId, action: 'CREATE', module: 'PROCUREMENT', recordId: po.id, reference: poNumber })
  return po
}

export async function receiveGRN(params: {
  poId: string
  warehouseId: string
  notes?: string
  items: Array<{ productId: string; batchNo: string; quantity: number; unitPrice: number }>
  userId: string
}) {
  const count = await db.goodsReceiptNote.count()
  const grnNumber = generateNumber('GRN', count + 1)

  return db.$transaction(async (tx) => {
    const grn = await tx.goodsReceiptNote.create({
      data: {
        grnNumber,
        poId:        params.poId,
        warehouseId: params.warehouseId,
        notes:       params.notes,
        receivedBy:  params.userId,
        items: { create: params.items.map(i => ({ productId: i.productId, batchNo: i.batchNo, quantity: i.quantity, unitPrice: i.unitPrice })) },
      },
    })
    for (const item of params.items) {
      await tx.stock.upsert({
        where: { productId_warehouseId_batchNo: { productId: item.productId, warehouseId: params.warehouseId, batchNo: item.batchNo } },
        create: { productId: item.productId, warehouseId: params.warehouseId, batchNo: item.batchNo, quantity: item.quantity },
        update: { quantity: { increment: item.quantity } },
      })
      await tx.purchaseOrderItem.updateMany({
        where: { poId: params.poId, productId: item.productId },
        data: { receivedQty: { increment: item.quantity } },
      })
    }
    return grn
  })
}

export async function getSupplierBills(status?: string) {
  return db.supplierBill.findMany({
    where: status ? { status: status as any } : undefined,
    include: { supplier: true, po: true },
    orderBy: { createdAt: 'desc' },
  })
}
