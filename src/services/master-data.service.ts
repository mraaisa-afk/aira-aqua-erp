import { db } from '@/lib/db'
import type { ProductInput, SupplierInput, CustomerInput } from '@/lib/validations/product'

// ---- Products ----
export async function getProducts(search?: string) {
  return db.product.findMany({
    where: search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { sku: { contains: search, mode: 'insensitive' } }] } : undefined,
    include: { category: true, unit: true },
    orderBy: { name: 'asc' },
  })
}

export async function getProductById(id: string) {
  return db.product.findUnique({ where: { id }, include: { category: true, unit: true } })
}

export async function createProduct(data: ProductInput) {
  return db.product.create({ data: { ...data, costPrice: data.costPrice, sellPrice: data.sellPrice } })
}

export async function updateProduct(id: string, data: Partial<ProductInput>) {
  return db.product.update({ where: { id }, data })
}

export async function deleteProduct(id: string) {
  return db.product.update({ where: { id }, data: { isActive: false } })
}

// ---- Suppliers ----
export async function getSuppliers(search?: string) {
  return db.supplier.findMany({
    where: search ? { name: { contains: search, mode: 'insensitive' } } : { isActive: true },
    orderBy: { name: 'asc' },
  })
}

export async function createSupplier(data: SupplierInput) {
  return db.supplier.create({ data })
}

export async function updateSupplier(id: string, data: Partial<SupplierInput>) {
  return db.supplier.update({ where: { id }, data })
}

// ---- Customers ----
export async function getCustomers(search?: string) {
  return db.customer.findMany({
    where: search ? { name: { contains: search, mode: 'insensitive' } } : { isActive: true },
    orderBy: { name: 'asc' },
  })
}

export async function createCustomer(data: CustomerInput) {
  return db.customer.create({ data })
}

export async function updateCustomer(id: string, data: Partial<CustomerInput>) {
  return db.customer.update({ where: { id }, data })
}

// ---- Categories & Units ----
export async function getCategories() {
  return db.category.findMany({ orderBy: { name: 'asc' } })
}

export async function getUnits() {
  return db.unit.findMany({ orderBy: { name: 'asc' } })
}

export async function getWarehouses() {
  return db.warehouse.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } })
}
