import { z } from 'zod'

export const productSchema = z.object({
  sku:           z.string().min(1, 'SKU আবশ্যক'),
  name:          z.string().min(1, 'পণ্যের নাম আবশ্যক'),
  description:   z.string().optional(),
  categoryId:    z.string().min(1, 'ক্যাটাগরি নির্বাচন করুন'),
  unitId:        z.string().min(1, 'একক নির্বাচন করুন'),
  costPrice:     z.coerce.number().min(0, 'ক্রয় মূল্য শূন্য বা ধনাত্মক হতে হবে'),
  sellPrice:     z.coerce.number().min(0, 'বিক্রয় মূল্য শূন্য বা ধনাত্মক হতে হবে'),
  minStockLevel: z.coerce.number().int().min(0),
})

export const supplierSchema = z.object({
  name:        z.string().min(1, 'সরবরাহকারীর নাম আবশ্যক'),
  contactName: z.string().optional(),
  phone:       z.string().optional(),
  email:       z.string().email().optional().or(z.literal('')),
  address:     z.string().optional(),
})

export const customerSchema = z.object({
  name:        z.string().min(1, 'গ্রাহকের নাম আবশ্যক'),
  contactName: z.string().optional(),
  phone:       z.string().optional(),
  email:       z.string().email().optional().or(z.literal('')),
  address:     z.string().optional(),
  creditLimit: z.coerce.number().min(0).default(0),
})

export type ProductInput   = z.infer<typeof productSchema>
export type SupplierInput  = z.infer<typeof supplierSchema>
export type CustomerInput  = z.infer<typeof customerSchema>
