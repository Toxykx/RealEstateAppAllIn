-- CreateEnum
CREATE TYPE "DealType" AS ENUM ('SALE', 'RENT');

-- CreateEnum
CREATE TYPE "KeyStatus" AS ENUM ('IN_OFFICE', 'WITH_AGENT', 'LOST', 'DUPLICATED');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('PROPERTY_CREATED', 'PROPERTY_EDITED', 'PRICE_CHANGED', 'PROPERTY_PUBLISHED', 'STATUS_CHANGED', 'STAGE_CHANGED', 'AGENT_ASSIGNED', 'CLIENT_ASSIGNED', 'VISIT_SCHEDULED', 'VISIT_COMPLETED', 'VISIT_CANCELLED', 'PROPERTY_VIEWED', 'TIMELINE_UPDATE_ADDED', 'DOCUMENT_UPLOADED', 'KEY_CHECKED_OUT', 'KEY_RETURNED', 'MEETING_LOGGED', 'CALL_LOGGED', 'DEAL_CLOSED');

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "dealType" "DealType" NOT NULL DEFAULT 'SALE',
ADD COLUMN     "keyHolderId" TEXT,
ADD COLUMN     "keyLastReturnedAt" TIMESTAMP(3),
ADD COLUMN     "keyLastTakenAt" TIMESTAMP(3),
ADD COLUMN     "keyStatus" "KeyStatus" NOT NULL DEFAULT 'IN_OFFICE';

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "activityType" "ActivityType" NOT NULL,
    "description" TEXT NOT NULL,
    "propertyId" TEXT,
    "agentId" TEXT,
    "clientId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActivityLog_propertyId_idx" ON "ActivityLog"("propertyId");

-- CreateIndex
CREATE INDEX "ActivityLog_agentId_idx" ON "ActivityLog"("agentId");

-- CreateIndex
CREATE INDEX "ActivityLog_activityType_idx" ON "ActivityLog"("activityType");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_keyHolderId_fkey" FOREIGN KEY ("keyHolderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
