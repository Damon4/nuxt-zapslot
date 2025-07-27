-- CreateTable
CREATE TABLE "contractor" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL,
    "categories" TEXT NOT NULL,
    "experience" TEXT,
    "portfolio" TEXT,
    "price" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contractor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contractor_userId_key" ON "contractor"("userId");

-- AddForeignKey
ALTER TABLE "contractor" ADD CONSTRAINT "contractor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
