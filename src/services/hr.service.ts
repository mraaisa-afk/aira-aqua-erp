import { db } from '@/lib/db'
import { createAuditLog } from './audit.service'
import type { EmployeeStatus, AttendanceStatus } from '@prisma/client'

export async function getEmployees(status?: EmployeeStatus) {
  return db.employee.findMany({
    where: status ? { status } : undefined,
    orderBy: { employeeId: 'asc' },
  })
}

export async function createEmployee(params: {
  employeeId: string
  name: string
  email?: string
  phone?: string
  designation: string
  department: string
  joiningDate: Date
  basicSalary: number
  userId: string
}) {
  const employee = await db.employee.create({
    data: {
      ...params,
      basicSalary: params.basicSalary,
      userId: undefined, // Remove userId from data
    },
  })
  await createAuditLog({ 
    userId: params.userId, 
    action: 'CREATE', 
    module: 'HR', 
    recordId: employee.id, 
    reference: employee.employeeId 
  })
  return employee
}

export async function recordAttendance(params: {
  employeeId: string
  date: Date
  status: AttendanceStatus
  checkIn?: Date
  checkOut?: Date
  notes?: string
  userId: string
}) {
  const attendance = await db.attendance.upsert({
    where: { employeeId_date: { employeeId: params.employeeId, date: params.date } },
    create: {
      employeeId: params.employeeId,
      date: params.date,
      status: params.status,
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      notes: params.notes,
    },
    update: {
      status: params.status,
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      notes: params.notes,
    },
  })
  await createAuditLog({ 
    userId: params.userId, 
    action: 'UPDATE', 
    module: 'HR', 
    recordId: attendance.id, 
    reference: `Attendance ${params.date.toISOString().split('T')[0]}` 
  })
  return attendance
}
