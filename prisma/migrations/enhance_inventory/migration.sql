-- Add advanced inventory tracking fields to Product
ALTER TABLE "products" ADD COLUMN "hsCode" VARCHAR(50);
ALTER TABLE "products" ADD COLUMN "packingSize" DECIMAL(18,3);
ALTER TABLE "products" ADD COLUMN "packingUnit" VARCHAR(50);
ALTER TABLE "products" ADD COLUMN "gradeStandard" VARCHAR(100);
ALTER TABLE "products" ADD COLUMN "storageCondition" VARCHAR(255);
ALTER TABLE "products" ADD COLUMN "shelfLife" INT;

-- Add batch/lot tracking to Stock
ALTER TABLE "stocks" ADD COLUMN "manufacturingDate" TIMESTAMP(3);
ALTER TABLE "stocks" ADD COLUMN "expiryDate" TIMESTAMP(3);
ALTER TABLE "stocks" ADD COLUMN "qualityStatus" VARCHAR(50) DEFAULT 'APPROVED';
ALTER TABLE "stocks" ADD COLUMN "location" VARCHAR(100);

-- Create Stock Valuation History table for FIFO/LIFO tracking
CREATE TABLE "stock_valuation_history" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "stockId" TEXT NOT NULL,
  "quantity" DECIMAL(18,3) NOT NULL,
  "unitCost" DECIMAL(18,2) NOT NULL,
  "valuationMethod" VARCHAR(20) NOT NULL,
  "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "stock_valuation_history_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "stocks" ("id") ON DELETE CASCADE
);

-- Create Inventory Valuation Report table
CREATE TABLE "inventory_valuation_reports" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "reportDate" TIMESTAMP(3) NOT NULL,
  "totalQuantity" DECIMAL(18,3) NOT NULL,
  "totalValue" DECIMAL(18,2) NOT NULL,
  "valuationMethod" VARCHAR(20) NOT NULL,
  "generatedBy" VARCHAR(255) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX "idx_stock_warehouseId_productId" ON "stocks"("warehouseId", "productId");
CREATE INDEX "idx_stock_qualityStatus" ON "stocks"("qualityStatus");
CREATE INDEX "idx_stock_adjustment_productId_date" ON "stock_adjustments"("productId", "adjustedAt");
