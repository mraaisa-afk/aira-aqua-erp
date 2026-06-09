-- Add IP address and user agent to audit logs
ALTER TABLE "audit_logs" ADD COLUMN "ipAddress" VARCHAR(45);
ALTER TABLE "audit_logs" ADD COLUMN "userAgent" TEXT;

-- Add index for faster audit log queries
CREATE INDEX "idx_audit_logs_userId_createdAt" ON "audit_logs"("userId", "createdAt" DESC);
CREATE INDEX "idx_audit_logs_action" ON "audit_logs"("action");
