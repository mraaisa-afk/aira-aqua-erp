import { db } from '@/lib/db'

export async function getDashboardKPIs() {
  const [totalCustomers, totalSuppliers, totalProducts, pendingPOs, unpaidBills, pendingInvoices, lowStockCount] = await Promise.all([
    db.customer.count({ where: { isActive: true } }),
    db.supplier.count({ where: { isActive: true } }),
    db.product.count({ where: { isActive: true } }),
    db.purchaseOrder.count({ where: { status: { in: ['DRAFT', 'SENT'] } } }),
    db.supplierBill.aggregate({ where: { status: { in: ['UNPAID', 'PARTIALLY_PAID'] } }, _sum: { amount: true, paidAmount: true } }),
    db.invoice.aggregate({ where: { status: { in: ['ISSUED', 'PARTIALLY_COLLECTED'] } }, _sum: { totalAmount: true, collected: true } }),
    db.stock.count({ where: { quantity: { lte: 0 } } }),
  ])

  const payableOutstanding = Number(unpaidBills._sum.amount ?? 0) - Number(unpaidBills._sum.paidAmount ?? 0)
  const receivableOutstanding = Number(pendingInvoices._sum.totalAmount ?? 0) - Number(pendingInvoices._sum.collected ?? 0)

  return {
    totalCustomers,
    totalSuppliers,
    totalProducts,
    pendingPOs,
    payableOutstanding,
    receivableOutstanding,
    lowStockCount,
  }
}

export async function getRecentSalesOrders(limit = 5) {
  return db.salesOrder.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: { customer: true, _count: { select: { invoices: true } } },
  })
}

export async function getRecentPurchaseOrders(limit = 5) {
  return db.purchaseOrder.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: { supplier: true },
  })
}
