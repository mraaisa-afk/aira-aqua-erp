'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema, type ProductInput } from '@/lib/validations/product'
import { createProductAction, updateProductAction } from '@/actions/master-data.actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { Plus, Pencil, Search } from 'lucide-react'

interface Props {
  products: any[]
  categories: any[]
  units: any[]
}

export function ProductsSection({ products, categories, units }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: { minStockLevel: 0, costPrice: 0, sellPrice: 0 },
  })

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  )

  function openCreate() {
    setEditing(null)
    reset({ minStockLevel: 0, costPrice: 0, sellPrice: 0 })
    setOpen(true)
  }

  function openEdit(p: any) {
    setEditing(p)
    reset({
      sku: p.sku, name: p.name, description: p.description ?? '',
      categoryId: p.categoryId, unitId: p.unitId,
      costPrice: Number(p.costPrice), sellPrice: Number(p.sellPrice),
      minStockLevel: p.minStockLevel,
    })
    setOpen(true)
  }

  async function onSubmit(data: ProductInput) {
    setLoading(true)
    setError('')
    const result = editing
      ? await updateProductAction(editing.id, data)
      : await createProductAction(data)
    setLoading(false)
    if (result.success) { setOpen(false); router.refresh() }
    else setError(result.error ?? 'অনুগ্রহ করে পুনরায় চেষ্টা করুন')
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>পণ্য তালিকা</CardTitle>
        <Button onClick={openCreate} size="sm"><Plus className="h-4 w-4 mr-2" />নতুন পণ্য</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="পণ্য বা SKU খুঁজুন..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {filtered.length === 0 ? (
          <p className="text-center text-gray-500 py-8">কোনো পণ্য পাওয়া যায়নি</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>পণ্যের নাম</TableHead>
                <TableHead>ক্যাটাগরি</TableHead>
                <TableHead>একক</TableHead>
                <TableHead>ক্রয় মূল্য</TableHead>
                <TableHead>বিক্রয় মূল্য</TableHead>
                <TableHead>সর্বনিম্ন মজুদ</TableHead>
                <TableHead>অবস্থা</TableHead>
                <TableHead>সম্পাদনা</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-sm">{p.sku}</TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.category?.name}</TableCell>
                  <TableCell>{p.unit?.symbol}</TableCell>
                  <TableCell>{formatCurrency(Number(p.costPrice))}</TableCell>
                  <TableCell>{formatCurrency(Number(p.sellPrice))}</TableCell>
                  <TableCell>{p.minStockLevel}</TableCell>
                  <TableCell>
                    <Badge variant={p.isActive ? 'success' : 'secondary'}>
                      {p.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'পণ্য সম্পাদনা' : 'নতুন পণ্য যোগ করুন'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>SKU *</Label>
                <Input {...register('sku')} placeholder="PRD-001" />
                {errors.sku && <p className="text-xs text-red-500">{errors.sku.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>পণ্যের নাম *</Label>
                <Input {...register('name')} placeholder="পণ্যের নাম লিখুন" />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>ক্যাটাগরি *</Label>
                <Select onValueChange={v => setValue('categoryId', v)} defaultValue={editing?.categoryId}>
                  <SelectTrigger><SelectValue placeholder="ক্যাটাগরি নির্বাচন করুন" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>একক *</Label>
                <Select onValueChange={v => setValue('unitId', v)} defaultValue={editing?.unitId}>
                  <SelectTrigger><SelectValue placeholder="একক নির্বাচন করুন" /></SelectTrigger>
                  <SelectContent>
                    {units.map(u => <SelectItem key={u.id} value={u.id}>{u.name} ({u.symbol})</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.unitId && <p className="text-xs text-red-500">{errors.unitId.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>ক্রয় মূল্য (হাজার টাকা) *</Label>
                <Input type="number" step="0.01" {...register('costPrice')} />
                {errors.costPrice && <p className="text-xs text-red-500">{errors.costPrice.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>বিক্রয় মূল্য (হাজার টাকা) *</Label>
                <Input type="number" step="0.01" {...register('sellPrice')} />
                {errors.sellPrice && <p className="text-xs text-red-500">{errors.sellPrice.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>সর্বনিম্ন মজুদ সীমা</Label>
                <Input type="number" {...register('minStockLevel')} />
              </div>
              <div className="space-y-1 col-span-2">
                <Label>বিবরণ (ঐচ্ছিক)</Label>
                <Input {...register('description')} placeholder="পণ্যের বিবরণ" />
              </div>
            </div>
            {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>বাতিল</Button>
              <Button type="submit" disabled={loading}>{loading ? 'সংরক্ষণ হচ্ছে...' : editing ? 'আপডেট করুন' : 'যোগ করুন'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
