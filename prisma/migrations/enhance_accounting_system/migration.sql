-- Create General Ledger table for tracking all account balances
CREATE TABLE "general_ledger" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "accountHeadId" TEXT NOT NULL,
  "debit" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "credit" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "balance" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "general_ledger_accountHeadId_fkey" FOREIGN KEY ("accountHeadId") REFERENCES "account_heads" ("id") ON DELETE CASCADE
);

-- Create index for faster ledger queries
CREATE UNIQUE INDEX "idx_general_ledger_accountHeadId" ON "general_ledger"("accountHeadId");

-- Add Bangladesh-specific fields to Supplier and Customer for VAT/BIN/TIN compliance
ALTER TABLE "suppliers" ADD COLUMN "binNumber" VARCHAR(50);
ALTER TABLE "suppliers" ADD COLUMN "tinNumber" VARCHAR(50);
ALTER TABLE "suppliers" ADD COLUMN "vatRegistered" BOOLEAN DEFAULT false;
ALTER TABLE "suppliers" ADD COLUMN "bankAccountNumber" VARCHAR(50);
ALTER TABLE "suppliers" ADD COLUMN "bankName" VARCHAR(100);

ALTER TABLE "customers" ADD COLUMN "binNumber" VARCHAR(50);
ALTER TABLE "customers" ADD COLUMN "tinNumber" VARCHAR(50);
ALTER TABLE "customers" ADD COLUMN "vatRegistered" BOOLEAN DEFAULT false;
ALTER TABLE "customers" ADD COLUMN "bankAccountNumber" VARCHAR(50);
ALTER TABLE "customers" ADD COLUMN "bankName" VARCHAR(100);

-- Add VAT tracking to invoices
ALTER TABLE "invoices" ADD COLUMN "vatAmount" DECIMAL(18,2) DEFAULT 0;
ALTER TABLE "invoices" ADD COLUMN "vatRate" DECIMAL(5,2) DEFAULT 15;
ALTER TABLE "invoices" ADD COLUMN "taxableAmount" DECIMAL(18,2) DEFAULT 0;

-- Add tax tracking to purchase orders
ALTER TABLE "purchase_orders" ADD COLUMN "vatAmount" DECIMAL(18,2) DEFAULT 0;
ALTER TABLE "purchase_orders" ADD COLUMN "vatRate" DECIMAL(5,2) DEFAULT 15;
ALTER TABLE "purchase_orders" ADD COLUMN "taxableAmount" DECIMAL(18,2) DEFAULT 0;

-- Create Accounts Receivable tracking table
CREATE TABLE "accounts_receivable" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "customerId" TEXT NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "amount" DECIMAL(18,2) NOT NULL,
  "paidAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "dueDate" TIMESTAMP(3),
  "status" VARCHAR(20) NOT NULL DEFAULT 'OUTSTANDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "accounts_receivable_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers" ("id") ON DELETE CASCADE,
  CONSTRAINT "accounts_receivable_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices" ("id") ON DELETE CASCADE
);

-- Create Accounts Payable tracking table
CREATE TABLE "accounts_payable" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "supplierId" TEXT NOT NULL,
  "billId" TEXT NOT NULL,
  "amount" DECIMAL(18,2) NOT NULL,
  "paidAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "dueDate" TIMESTAMP(3),
  "status" VARCHAR(20) NOT NULL DEFAULT 'OUTSTANDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "accounts_payable_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers" ("id") ON DELETE CASCADE,
  CONSTRAINT "accounts_payable_billId_fkey" FOREIGN KEY ("billId") REFERENCES "supplier_bills" ("id") ON DELETE CASCADE
);

-- Create indexes for AR/AP queries
CREATE INDEX "idx_accounts_receivable_customerId_status" ON "accounts_receivable"("customerId", "status");
CREATE INDEX "idx_accounts_payable_supplierId_status" ON "accounts_payable"("supplierId", "status");

-- Add posting date and approval fields to vouchers for better audit trail
ALTER TABLE "vouchers" ADD COLUMN "approvedBy" VARCHAR(255);
ALTER TABLE "vouchers" ADD COLUMN "approvedAt" TIMESTAMP(3);
ALTER TABLE "vouchers" ADD COLUMN "reference" VARCHAR(255);
