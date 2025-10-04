-- CreateTable
CREATE TABLE "public"."group_topics" (
    "id" TEXT NOT NULL,
    "topicName" TEXT NOT NULL,
    "topicId" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "systemId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_topics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "group_topics_groupId_idx" ON "public"."group_topics"("groupId");

-- CreateIndex
CREATE INDEX "group_topics_systemId_idx" ON "public"."group_topics"("systemId");

-- CreateIndex
CREATE UNIQUE INDEX "group_topics_groupId_topicName_key" ON "public"."group_topics"("groupId", "topicName");

-- AddForeignKey
ALTER TABLE "public"."group_topics" ADD CONSTRAINT "group_topics_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."telegram_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."group_topics" ADD CONSTRAINT "group_topics_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "public"."System"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
