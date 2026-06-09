-- Add advanced HR fields to Employee
ALTER TABLE "employees" ADD COLUMN "fathersName" VARCHAR(255);
ALTER TABLE "employees" ADD COLUMN "mothersName" VARCHAR(255);
ALTER TABLE "employees" ADD COLUMN "dateOfBirth" TIMESTAMP(3);
ALTER TABLE "employees" ADD COLUMN "nidNumber" VARCHAR(50);
ALTER TABLE "employees" ADD COLUMN "passportNumber" VARCHAR(50);
ALTER TABLE "employees" ADD COLUMN "bankAccountNumber" VARCHAR(50);
ALTER TABLE "employees" ADD COLUMN "bankName" VARCHAR(100);
ALTER TABLE "employees" ADD COLUMN "tinNumber" VARCHAR(50);
ALTER TABLE "employees" ADD COLUMN "gender" VARCHAR(20);
ALTER TABLE "employees" ADD COLUMN "maritalStatus" VARCHAR(20);
ALTER TABLE "employees" ADD COLUMN "bloodGroup" VARCHAR(5);
ALTER TABLE "employees" ADD COLUMN "emergencyContactName" VARCHAR(255);
ALTER TABLE "employees" ADD COLUMN "emergencyContactPhone" VARCHAR(20);
ALTER TABLE "employees" ADD COLUMN "contractType" VARCHAR(50);
ALTER TABLE "employees" ADD COLUMN "contractEndDate" TIMESTAMP(3);

-- Create Leave Request table
CREATE TABLE "leave_requests" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "employeeId" TEXT NOT NULL,
  "leaveType" VARCHAR(50) NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "numberOfDays" INT NOT NULL,
  "reason" TEXT,
  "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  "approvedBy" VARCHAR(255),
  "approvedAt" TIMESTAMP(3),
  "rejectionReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "leave_requests_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees" ("id") ON DELETE CASCADE
);

-- Create Leave Balance table
CREATE TABLE "leave_balances" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "employeeId" TEXT NOT NULL,
  "year" INT NOT NULL,
  "annualLeave" INT NOT NULL DEFAULT 14,
  "sickLeave" INT NOT NULL DEFAULT 10,
  "casualLeave" INT NOT NULL DEFAULT 5,
  "maternityLeave" INT NOT NULL DEFAULT 0,
  "paternityLeave" INT NOT NULL DEFAULT 0,
  "usedAnnualLeave" INT NOT NULL DEFAULT 0,
  "usedSickLeave" INT NOT NULL DEFAULT 0,
  "usedCasualLeave" INT NOT NULL DEFAULT 0,
  "usedMaternityLeave" INT NOT NULL DEFAULT 0,
  "usedPaternityLeave" INT NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "leave_balances_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees" ("id") ON DELETE CASCADE,
  UNIQUE("employeeId", "year")
);

-- Add detailed payroll fields
ALTER TABLE "salary_slips" ADD COLUMN "basicSalaryAmount" DECIMAL(18,2) NOT NULL DEFAULT 0;
ALTER TABLE "salary_slips" ADD COLUMN "houseRent" DECIMAL(18,2) DEFAULT 0;
ALTER TABLE "salary_slips" ADD COLUMN "medicalAllowance" DECIMAL(18,2) DEFAULT 0;
ALTER TABLE "salary_slips" ADD COLUMN "transportAllowance" DECIMAL(18,2) DEFAULT 0;
ALTER TABLE "salary_slips" ADD COLUMN "otherAllowances" DECIMAL(18,2) DEFAULT 0;
ALTER TABLE "salary_slips" ADD COLUMN "providentFund" DECIMAL(18,2) DEFAULT 0;
ALTER TABLE "salary_slips" ADD COLUMN "incomeTax" DECIMAL(18,2) DEFAULT 0;
ALTER TABLE "salary_slips" ADD COLUMN "otherDeductions" DECIMAL(18,2) DEFAULT 0;
ALTER TABLE "salary_slips" ADD COLUMN "workingDays" INT DEFAULT 26;
ALTER TABLE "salary_slips" ADD COLUMN "presentDays" INT DEFAULT 26;
ALTER TABLE "salary_slips" ADD COLUMN "absentDays" INT DEFAULT 0;
ALTER TABLE "salary_slips" ADD COLUMN "leavesTaken" INT DEFAULT 0;

-- Create Performance Review table
CREATE TABLE "performance_reviews" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "employeeId" TEXT NOT NULL,
  "reviewPeriodStart" TIMESTAMP(3) NOT NULL,
  "reviewPeriodEnd" TIMESTAMP(3) NOT NULL,
  "reviewedBy" VARCHAR(255) NOT NULL,
  "rating" DECIMAL(3,2) NOT NULL,
  "comments" TEXT,
  "strengths" TEXT,
  "areasForImprovement" TEXT,
  "goals" TEXT,
  "status" VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "performance_reviews_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees" ("id") ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX "idx_leave_requests_employeeId_status" ON "leave_requests"("employeeId", "status");
CREATE INDEX "idx_leave_requests_startDate_endDate" ON "leave_requests"("startDate", "endDate");
CREATE INDEX "idx_leave_balances_employeeId_year" ON "leave_balances"("employeeId", "year");
CREATE INDEX "idx_performance_reviews_employeeId" ON "performance_reviews"("employeeId");
