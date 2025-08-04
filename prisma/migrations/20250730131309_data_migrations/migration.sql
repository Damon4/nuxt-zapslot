-- CreateTable
CREATE TABLE "_data_migrations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "executed_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "_data_migrations_pkey" PRIMARY KEY ("id")
);
