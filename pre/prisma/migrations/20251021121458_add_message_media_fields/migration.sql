-- AlterTable
ALTER TABLE "direct_messages" ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "fileName" TEXT,
ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "mimeType" TEXT;
