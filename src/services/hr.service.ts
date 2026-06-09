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


// Advanced HR Functions

export async function calculatePayroll(month: number, year: number, userId: string) {
  return await db.$transaction(async (tx) => {
    let payroll = await tx.payroll.findUnique({
      where: { month_year: { month, year } },
    })

    if (!payroll) {
      payroll = await tx.payroll.create({
        data: { month, year, status: 'DRAFT' },
      })
    }

    const employees = await tx.employee.findMany({
      where: { status: 'ACTIVE' },
    })

    const salarySlips = []

    for (const employee of employees) {
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0)

      const attendances = await tx.attendance.findMany({
        where: {
          employeeId: employee.id,
          date: { gte: startDate, lte: endDate },
        },
      })

      const presentDays = attendances.filter((a) => a.status === 'PRESENT').length
      const absentDays = attendances.filter((a) => a.status === 'ABSENT').length
      const leavesTaken = attendances.filter((a) => a.status === 'ON_LEAVE').length
      const workingDays = 26

      const basicSalary = Number(employee.basicSalary)
      const houseRent = basicSalary * 0.5
      const medicalAllowance = basicSalary * 0.05
      const transportAllowance = basicSalary * 0.1
      const totalAllowances = houseRent + medicalAllowance + transportAllowance

      const providentFund = basicSalary * 0.1
      const incomeTax = (basicSalary + totalAllowances) * 0.1
      const totalDeductions = providentFund + incomeTax

      const grossSalary = basicSalary + totalAllowances
      const netSalary = grossSalary - totalDeductions

      const salarySlip = await tx.salarySlip.create({
        data: {
          payrollId: payroll.id,
          employeeId: employee.id,
          basicSalary: basicSalary,
          allowances: totalAllowances,
          deductions: totalDeductions,
          netSalary: netSalary,
          basicSalaryAmount: basicSalary,
          houseRent: houseRent,
          medicalAllowance: medicalAllowance,
          transportAllowance: transportAllowance,
          providentFund: providentFund,
          incomeTax: incomeTax,
          workingDays,
          presentDays,
          absentDays,
          leavesTaken,
        },
      })

      salarySlips.push(salarySlip)
    }

    await createAuditLog({
      userId,
      action: 'CREATE',
      module: 'HR',
      recordId: payroll.id,
      reference: `Payroll ${month}/${year}`,
    })

    return { payroll, salarySlips, totalSlips: salarySlips.length }
  })
}

export async function processPayroll(payrollId: string, userId: string) {
  const payroll = await db.payroll.update({
    where: { id: payrollId },
    data: {
      status: 'PROCESSED',
      processedBy: userId,
      processedAt: new Date(),
    },
  })

  await createAuditLog({
    userId,
    action: 'POST',
    module: 'HR',
    recordId: payrollId,
    reference: `Payroll Processed`,
  })

  return payroll
}

export async function requestLeave(
  employeeId: string,
  leaveType: string,
  startDate: Date,
  endDate: Date,
  reason: string,
  userId: string
) {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  const numberOfDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

  const leaveRequest = await db.leaveRequest.create({
    data: {
      employeeId,
      leaveType,
      startDate,
      endDate,
      numberOfDays,
      reason,
      status: 'PENDING',
    },
  })

  await createAuditLog({
    userId,
    action: 'CREATE',
    module: 'HR',
    recordId: leaveRequest.id,
    reference: `Leave Request ${leaveType}`,
  })

  return leaveRequest
}

export async function approveLeaveRequest(
  leaveRequestId: string,
  approvedBy: string,
  userId: string
) {
  const leaveRequest = await db.leaveRequest.update({
    where: { id: leaveRequestId },
    data: {
      status: 'APPROVED',
      approvedBy,
      approvedAt: new Date(),
    },
  })

  await createAuditLog({
    userId,
    action: 'APPROVE',
    module: 'HR',
    recordId: leaveRequestId,
    reference: 'Leave Request Approved',
  })

  return leaveRequest
}

export async function getPendingLeaveRequests(employeeId?: string) {
  return await db.leaveRequest.findMany({
    where: {
      status: 'PENDING',
      ...(employeeId && { employeeId }),
    },
    include: { employee: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getLeaveBalance(employeeId: string, year: number) {
  let balance = await db.leaveBalance.findUnique({
    where: { employeeId_year: { employeeId, year } },
  })

  if (!balance) {
    balance = await db.leaveBalance.create({
      data: { employeeId, year },
    })
  }

  return {
    ...balance,
    availableAnnualLeave: balance.annualLeave - balance.usedAnnualLeave,
    availableSickLeave: balance.sickLeave - balance.usedSickLeave,
    availableCasualLeave: balance.casualLeave - balance.usedCasualLeave,
  }
}

export async function createPerformanceReview(
  employeeId: string,
  reviewPeriodStart: Date,
  reviewPeriodEnd: Date,
  reviewedBy: string,
  rating: number,
  comments: string,
  strengths: string,
  areasForImprovement: string,
  goals: string,
  userId: string
) {
  const review = await db.performanceReview.create({
    data: {
      employeeId,
      reviewPeriodStart,
      reviewPeriodEnd,
      reviewedBy,
      rating: rating,
      comments,
      strengths,
      areasForImprovement,
      goals,
      status: 'DRAFT',
    },
  })

  await createAuditLog({
    userId,
    action: 'CREATE',
    module: 'HR',
    recordId: review.id,
    reference: `Performance Review`,
  })

  return review
}

export async function getEmployeePerformanceReviews(employeeId: string) {
  return await db.performanceReview.findMany({
    where: { employeeId },
    orderBy: { reviewPeriodEnd: 'desc' },
  })
}
