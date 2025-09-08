-- CreateTable
CREATE TABLE "public"."UserDeclaration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserDeclaration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserDeclaration_userId_groupId_systemId_key" ON "public"."UserDeclaration"("userId", "groupId", "systemId");

-- AddForeignKey
ALTER TABLE "public"."UserDeclaration" ADD CONSTRAINT "UserDeclaration_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."telegram_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserDeclaration" ADD CONSTRAINT "UserDeclaration_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "public"."System"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
