'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { customerSchema, type CustomerInput } from '@/lib/validations/product'
import { createCustomerAction } from '@/actions/master-data.actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { Plus, Search } from 'lucide-react'

interface Props { customers: any[] }

export function CustomersSection({ customers }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CustomerInput>({ resolver: zodResolver(customerSchema) })

  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

  async function onSubmit(data: CustomerInput) {
    setLoading(true)
    setError('')
    const result = await createCustomerAction(data)
    setLoading(false)
    if (result.success) { setOpen(false); reset(); router.refresh() }
    else setError(result.error ?? 'সমস্যা হয়েছে')
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>গ্রাহক তালিকা</CardTitle>
        <Button onClick={() => setOpen(true)} size="sm"><Plus className="h-4 w-4 mr-2" />নতুন গ্রাহক</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="গ্রাহক খুঁজুন..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {filtered.length === 0 ? <p className="text-center text-gray-500 py-8">কোনো গ্রাহক নেই</p> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>নাম</TableHead>
                <TableHead>ফোন</TableHead>
                <TableHead>ইমেইল</TableHead>
                <TableHead>ক্রেডিট সীমা</TableHead>
                <TableHead>অবস্থা</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.phone ?? '-'}</TableCell>
                  <TableCell>{c.email ?? '-'}</TableCell>
                  <TableCell>{formatCurrency(Number(c.creditLimit))}</TableCell>
                  <TableCell><Badge variant={c.isActive ? 'success' : 'secondary'}>{c.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>নতুন গ্রাহক যোগ করুন</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1"><Label>গ্রাহকের নাম *</Label><Input {...register('name')} />{errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}</div>
            <div className="space-y-1"><Label>যোগাযোগ ব্যক্তি</Label><Input {...register('contactName')} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>ফোন</Label><Input {...register('phone')} /></div>
              <div className="space-y-1"><Label>ইমেইল</Label><Input {...register('email')} type="email" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>ঠিকানা</Label><Input {...register('address')} /></div>
              <div className="space-y-1"><Label>ক্রেডিট সীমা (টাকা)</Label><Input type="number" {...register('creditLimit')} /></div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>বাতিল</Button>
              <Button type="submit" disabled={loading}>{loading ? 'যোগ হচ্ছে...' : 'যোগ করুন'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
