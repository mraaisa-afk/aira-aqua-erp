import { getDashboardKPIs, getRecentPurchaseOrders, getRecentSalesOrders } from '@/services/dashboard.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Users, Package, ShoppingCart, AlertTriangle, TrendingDown, TrendingUp, Receipt } from 'lucide-react'
import { STATUS_LABELS } from '@/types'

export default async function DashboardPage() {
  const [kpis, recentPOs, recentSOs] = await Promise.all([
    getDashboardKPIs(),
    getRecentPurchaseOrders(5),
    getRecentSalesOrders(5),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ড্যাশবোর্ড</h1>
        <p className="text-gray-500 text-sm mt-1">আপনার ব্যবসার সার্বিক চিত্র</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">মোট গ্রাহক</CardTitle>
            <Users className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kpis.totalCustomers}</div>
            <p className="text-xs text-gray-500 mt-1">সক্রিয় গ্রাহক</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">মোট পণ্য</CardTitle>
            <Package className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kpis.totalProducts}</div>
            <p className="text-xs text-gray-500 mt-1">সক্রিয় SKU</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">বকেয়া প্রদেয়</CardTitle>
            <TrendingDown className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{formatCurrency(kpis.payableOutstanding)}</div>
            <p className="text-xs text-gray-500 mt-1">সরবরাহকারীকে প্রদেয়</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">বকেয়া প্রাপ্য</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{formatCurrency(kpis.receivableOutstanding)}</div>
            <p className="text-xs text-gray-500 mt-1">গ্রাহকের কাছথেকে প্রাপ্য</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">মোট সরবরাহকারী</CardTitle>
            <ShoppingCart className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kpis.totalSuppliers}</div>
            <p className="text-xs text-gray-500 mt-1">সক্রিয় সরবরাহকারী</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">বাতিলঘ্য ক্রয় অর্ডার</CardTitle>
            <Receipt className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{kpis.pendingPOs}</div>
            <p className="text-xs text-gray-500 mt-1">প্রক্রিয়ারধীন PO</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">শূন্য মজুদ পণ্য</CardTitle>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{kpis.lowStockCount}</div>
            <p className="text-xs text-gray-500 mt-1">স্টক শূন্য বা সর্বনিম্ন</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>সাম্প্রতিক ক্রয় অর্ডার</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPOs.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">কোনো ডেটা নেই</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO নম্বর</TableHead>
                    <TableHead>সরবরাহকারী</TableHead>
                    <TableHead>মোট মূল্য</TableHead>
                    <TableHead>অবস্থা</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPOs.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell className="font-medium">{po.poNumber}</TableCell>
                      <TableCell>{po.supplier.name}</TableCell>
                      <TableCell>{formatCurrency(Number(po.totalAmount))}</TableCell>
                      <TableCell>
                        <Badge variant={po.status === 'FULLY_RECEIVED' ? 'success' : po.status === 'CANCELLED' ? 'destructive' : 'secondary'}>
                          {STATUS_LABELS[po.status] ?? po.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>সাম্প্রতিক বিক্রয় অর্ডার</CardTitle>
          </CardHeader>
          <CardContent>
            {recentSOs.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">কোনো ডেটা নেই</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SO নম্বর</TableHead>
                    <TableHead>গ্রাহক</TableHead>
                    <TableHead>তারিখ</TableHead>
                    <TableHead>অবস্থা</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSOs.map((so) => (
                    <TableRow key={so.id}>
                      <TableCell className="font-medium">{so.soNumber}</TableCell>
                      <TableCell>{so.customer.name}</TableCell>
                      <TableCell>{formatDate(so.createdAt)}</TableCell>
                      <TableCell>
                        <Badge variant={so.status === 'COMPLETED' ? 'success' : so.status === 'CANCELLED' ? 'destructive' : 'secondary'}>
                          {STATUS_LABELS[so.status] ?? so.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
