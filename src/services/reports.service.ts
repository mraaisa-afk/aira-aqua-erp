import { db } from '@/lib/db'

export async function getInventoryValuation() {
  const stocks = await db.stock.findMany({
    include: { product: true },
  })
  
  const valuation = stocks.reduce((acc, stock) => {
    const value = Number(stock.quantity) * Number(stock.product.costPrice)
    return acc + value
  }, 0)
  
  return {
    totalValue: valuation,
    itemCount: stocks.length,
    timestamp: new Date(),
  }
}

export async function getSalesReport(fromDate: Date, toDate: Date) {
  const invoices = await db.invoice.findMany({
    where: {
      issuedAt: { gte: fromDate, lte: toDate },
      status: { not: 'CANCELLED' },
    },
    include: { so: { include: { customer: true } } },
  })
  
  const totalSales = invoices.reduce((acc, inv) => acc + Number(inv.totalAmount), 0)
  const totalCollected = invoices.reduce((acc, inv) => acc + Number(inv.collected), 0)
  
  return {
    totalSales,
    totalCollected,
    invoiceCount: invoices.length,
    period: { from: fromDate, to: toDate },
  }
}

export async function getProfitLoss(fromDate: Date, toDate: Date) {
  // Income from Sales
  const sales = await db.invoice.aggregate({
    where: { issuedAt: { gte: fromDate, lte: toDate }, status: { not: 'CANCELLED' } },
    _sum: { totalAmount: true },
  })
  
  // Expenses from Expense Claims
  const expenses = await db.expenseClaim.aggregate({
    where: { date: { gte: fromDate, lte: toDate }, status: 'PAID' },
    _sum: { amount: true },
  })
  
  // Cost of Goods Sold (Simplified: based on POs received)
  const cogs = await db.purchaseOrder.aggregate({
    where: { orderDate: { gte: fromDate, lte: toDate }, status: 'FULLY_RECEIVED' },
    _sum: { totalAmount: true },
  })
  
  const totalIncome = Number(sales._sum.totalAmount ?? 0)
  const totalExpenses = Number(expenses._sum.amount ?? 0)
  const totalCOGS = Number(cogs._sum.totalAmount ?? 0)
  
  return {
    grossProfit: totalIncome - totalCOGS,
    netProfit: totalIncome - totalCOGS - totalExpenses,
    income: totalIncome,
    cogs: totalCOGS,
    expenses: totalExpenses,
    period: { from: fromDate, to: toDate },
  }
}

export async function getSupplierLiability() {
  const bills = await db.supplierBill.findMany({
    where: { status: { not: 'PAID' } },
    include: { supplier: true },
  })
  
  const totalLiability = bills.reduce((acc, bill) => {
    return acc + (Number(bill.amount) - Number(bill.paidAmount))
  }, 0)
  
  return {
    totalLiability,
    billCount: bills.length,
    timestamp: new Date(),
  }
}
