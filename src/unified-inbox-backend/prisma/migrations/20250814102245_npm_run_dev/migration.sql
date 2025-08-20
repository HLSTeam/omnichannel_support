-- CreateTable
CREATE TABLE "public"."Rule" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rule_systemId_keyword_key" ON "public"."Rule"("systemId", "keyword");

-- AddForeignKey
ALTER TABLE "public"."Rule" ADD CONSTRAINT "Rule_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "public"."System"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
