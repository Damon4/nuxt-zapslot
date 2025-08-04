/*
  Warnings:

  - You are about to drop the column `adminNotes` on the `contractor` table. All the data in the column will be lost.
  - You are about to drop the column `rejectionReason` on the `contractor` table. All the data in the column will be lost.
  - Made the column `appliedAt` on table `contractor` required. This step will fail if there are existing NULL values in that column.
  - Made the column `approvedAt` on table `contractor` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "contractor" DROP COLUMN "adminNotes",
DROP COLUMN "rejectionReason",
ALTER COLUMN "status" SET DEFAULT 1,
ALTER COLUMN "appliedAt" SET NOT NULL,
ALTER COLUMN "appliedAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "approvedAt" SET NOT NULL,
ALTER COLUMN "approvedAt" SET DEFAULT CURRENT_TIMESTAMP;
