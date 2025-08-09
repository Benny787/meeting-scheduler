-- AlterTable
ALTER TABLE "Account" ADD COLUMN "refresh_token_expires_in" INTEGER;

-- CreateTable
CREATE TABLE "MeetingAvailability" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "from" DATETIME NOT NULL,
    "to" DATETIME NOT NULL,
    "busy" JSONB NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "MeetingAvailability_sessionId_userId_from_to_key" ON "MeetingAvailability"("sessionId", "userId", "from", "to");
