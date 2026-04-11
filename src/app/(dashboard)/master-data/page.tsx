import { getProducts, getSuppliers, getCustomers, getWarehouses, getCategories, getUnits } from '@/services/master-data.service'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProductsSection } from '@/components/master-data/products-section'
import { SuppliersSection } from '@/components/master-data/suppliers-section'
import { CustomersSection } from '@/components/master-data/customers-section'
import { WarehousesSection } from '@/components/master-data/warehouses-section'

export default async function MasterDataPage() {
  const [products, suppliers, customers, warehouses, categories, units] = await Promise.all([
    getProducts(),
    getSuppliers(),
    getCustomers(),
    getWarehouses(),
    getCategories(),
    getUnits(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">মাস্টার ডেটা</h1>
        <p className="text-gray-500 text-sm mt-1">পণ্য, সরবরাহকারী, গ্রাহক তথ্য পরিচালনা</p>
      </div>
      <Tabs defaultValue="products">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="products">পণ্য ({products.length})</TabsTrigger>
          <TabsTrigger value="suppliers">সরবরাহকারী ({suppliers.length})</TabsTrigger>
          <TabsTrigger value="customers">গ্রাহক ({customers.length})</TabsTrigger>
          <TabsTrigger value="warehouses">গুদাম ({warehouses.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="products">
          <ProductsSection products={products} categories={categories} units={units} />
        </TabsContent>
        <TabsContent value="suppliers">
          <SuppliersSection suppliers={suppliers} />
        </TabsContent>
        <TabsContent value="customers">
          <CustomersSection customers={customers} />
        </TabsContent>
        <TabsContent value="warehouses">
          <WarehousesSection warehouses={warehouses} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
