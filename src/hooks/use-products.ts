'use client'
import { useQuery } from '@tanstack/react-query'

export function useProducts(search?: string) {
  return useQuery({
    queryKey: ['products', search],
    queryFn: async () => {
      const url = search ? `/api/v1/products?search=${encodeURIComponent(search)}` : '/api/v1/products'
      const res = await fetch(url)
      if (!res.ok) throw new Error('পণ্য তালিকা লোড হয়নি')
      return res.json()
    },
  })
}

export function useSuppliers() {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const res = await fetch('/api/v1/suppliers')
      if (!res.ok) throw new Error('সরবরাহকারী তালিকা লোড হয়নি')
      return res.json()
    },
  })
}

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await fetch('/api/v1/customers')
      if (!res.ok) throw new Error('গ্রাহক তালিকা লোড হয়নি')
      return res.json()
    },
  })
}
