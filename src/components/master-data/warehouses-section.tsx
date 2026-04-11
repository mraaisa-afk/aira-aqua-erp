import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface Props { warehouses: any[] }

export function WarehousesSection({ warehouses }: Props) {
  return (
    <Card>
      <CardHeader><CardTitle>গুদাম তালিকা</CardTitle></CardHeader>
      <CardContent>
        {warehouses.length === 0 ? <p className="text-center text-gray-500 py-8">কোনো গুদাম নেই</p> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>গুদামের নাম</TableHead>
                <TableHead>ঠিকানা</TableHead>
                <TableHead>অবস্থা</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {warehouses.map(w => (
                <TableRow key={w.id}>
                  <TableCell className="font-medium">{w.name}</TableCell>
                  <TableCell>{w.address ?? '-'}</TableCell>
                  <TableCell><Badge variant={w.isActive ? 'success' : 'secondary'}>{w.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
