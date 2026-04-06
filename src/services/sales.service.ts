import { db } from '@/lib/db'
import { generateNumber } from '@/lib/utils'
import { createAuditLog } from './audit.service'

export async function getSalesOrders(status?: string) {
  return db.salesOrder.findMany({
    where: status ? { status: status as any } : undefined,
    include: { customer: true, items: { include: { product: true } }, _count: { select: { invoices: true } } },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createSalesOrder(params: {
  customerId: string
  notes?: string
  items: Array<{ productId: string; quantity: number; unitPrice: number }>
  userId: string
}) {
  const count = await db.salesOrder.count()
  const soNumber = generateNumber('SO', count + 1)

  const so = await db.salesOrder.create({
    data: {
      soNumber,
      customerId: params.customerId,
      notes:      params.notes,
      createdBy:  params.userId,
      items: { create: params.items },
    },
    include: { items: true },
  })
  await createAuditLog({ userId: params.userId, action: 'CREATE', module: 'SALES', recordId: so.id, reference: soNumber })
  return so
}

export async function createInvoice(params: {
  soId: string
  dueDate?: Date
  userId: string
}) {
  const so = await db.salesOrder.findUnique({
    where: { id: params.soId },
    include: { items: { include: { product: true } } },
  })
  if (!so) throw new Error('সেলস অর্ডার পাওয়া যায়নি')

  // Verify stock for all items before invoicing
  for (const item of so.items) {
    const totalStock = await db.stock.aggregate({
      where: { productId: item.productId },
      _sum: { quantity: true },
    })
    const available = Number(totalStock._sum.quantity ?? 0)
    if (available < Number(item.quantity)) {
      throw new Error(`${item.product.name}: প্রয়োজনীয় মজুদ নেই (বিদ্যমান: ${available})`)
    }
  }

  const totalAmount = so.items.reduce((s, i) => s + Number(i.quantity) * Number(i.unitPrice), 0)
  const count = await db.invoice.count()
  const invoiceNo = generateNumber('INV', count + 1)

  const invoice = await db.invoice.create({
    data: { invoiceNo, soId: params.soId, totalAmount, dueDate: params.dueDate, issuedAt: new Date(), status: 'ISSUED' },
  })
  await db.salesOrder.update({ where: { id: params.soId }, data: { status: 'INVOICED' } })
  await createAuditLog({ userId: params.userId, action: 'CREATE', module: 'SALES', recordId: invoice.id, reference: invoiceNo })
  return invoice
}

export async function getInvoices(status?: string) {
  return db.invoice.findMany({
    where: status ? { status: status as any } : undefined,
    include: { so: { include: { customer: true } }, collections: true, shipments: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function recordCollection(params: {
  invoiceId: string
  amount: number
  reference?: string
  userId: string
}) {
  return db.$transaction(async (tx) => {
    const invoice = await tx.invoice.findUnique({ where: { id: params.invoiceId } })
    if (!invoice) throw new Error('ইনভয়েস পাওয়া যায়নি')
    const collection = await tx.collection.create({
      data: { invoiceId: params.invoiceId, amount: params.amount, collectedBy: params.userId, reference: params.reference },
    })
    const newCollected = Number(invoice.collected) + params.amount
    const newStatus = newCollected >= Number(invoice.totalAmount) ? 'COLLECTED' : 'PARTIALLY_COLLECTED'
    await tx.invoice.update({ where: { id: params.invoiceId }, data: { collected: newCollected, status: newStatus } })
    return collection
  })
}
