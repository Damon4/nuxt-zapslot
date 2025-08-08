-- CreateTable
CREATE TABLE "review" (
    "id" SERIAL NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "clientId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "review_serviceId_idx" ON "review"("serviceId");

-- CreateIndex
CREATE INDEX "review_clientId_idx" ON "review"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "review_serviceId_clientId_key" ON "review"("serviceId", "clientId");

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
