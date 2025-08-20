-- CreateTable
CREATE TABLE "public"."System" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "System_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Channel" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "token" TEXT,
    "systemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Channel_systemId_type_key" ON "public"."Channel"("systemId", "type");

-- AddForeignKey
ALTER TABLE "public"."Channel" ADD CONSTRAINT "Channel_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "public"."System"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
