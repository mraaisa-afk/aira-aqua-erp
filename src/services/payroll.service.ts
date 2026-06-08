import { db } from '@/lib/db'
import { createAuditLog } from './audit.service'

export async function generatePayroll(params: {
  month: number
  year: number
  userId: string
}) {
  return db.$transaction(async (tx) => {
    const payroll = await tx.payroll.create({
      data: {
        month: params.month,
        year: params.year,
        status: 'DRAFT',
      },
    })

    const employees = await tx.employee.findMany({
      where: { status: 'ACTIVE' },
    })

    const salarySlips = await Promise.all(
      employees.map((emp) =>
        tx.salarySlip.create({
          data: {
            payrollId: payroll.id,
            employeeId: emp.id,
            basicSalary: emp.basicSalary,
            netSalary: emp.basicSalary, // Simple logic for now
          },
        })
      )
    )

    await createAuditLog({ 
      userId: params.userId, 
      action: 'CREATE', 
      module: 'PAYROLL', 
      recordId: payroll.id, 
      reference: `Payroll ${params.month}/${params.year}` 
    })

    return { payroll, salarySlips }
  })
}

export async function processPayroll(payrollId: string, userId: string) {
  const payroll = await db.payroll.update({
    where: { id: payrollId },
    data: {
      status: 'PROCESSED',
      processedAt: new Date(),
      processedBy: userId,
    },
  })
  await createAuditLog({ 
    userId, 
    action: 'APPROVE', 
    module: 'PAYROLL', 
    recordId: payrollId, 
    reference: `Payroll ${payroll.month}/${payroll.year}` 
  })
  return payroll
}
