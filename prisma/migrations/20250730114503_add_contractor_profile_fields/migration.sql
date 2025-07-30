-- AlterTable
ALTER TABLE "contractor" ADD COLUMN     "adminNotes" TEXT,
ADD COLUMN     "appliedAt" TIMESTAMP(3),
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "availability" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "priceRange" TEXT,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "serviceArea" TEXT,
ADD COLUMN     "socialLinks" TEXT,
ADD COLUMN     "website" TEXT;

-- CreateTable
CREATE TABLE "contractor_category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "contractor_category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contractor_category_name_key" ON "contractor_category"("name");
