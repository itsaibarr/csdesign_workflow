/*
  Warnings:

  - The `category` column on the `Tool` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `ToolUsage` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,providerId]` on the table `account` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shortDescription` to the `Tool` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Tool` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ToolCategory" AS ENUM ('LLM', 'AUTOMATION', 'DESIGN', 'IDE', 'SECURITY', 'RESEARCH', 'PRODUCTIVITY', 'OTHER');

-- CreateEnum
CREATE TYPE "ToolUsageStatus" AS ENUM ('COURSE_OFFICIAL', 'COMMUNITY_APPROVED', 'PENDING_REVIEW', 'AI_DISCOVERED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PricingModel" AS ENUM ('FREE', 'FREEMIUM', 'PAID', 'TRIAL');

-- AlterEnum
ALTER TYPE "ArtifactStatus" ADD VALUE 'NEEDS_IMPROVEMENT';

-- DropForeignKey
ALTER TABLE "ToolUsage" DROP CONSTRAINT "ToolUsage_artifactId_fkey";

-- DropForeignKey
ALTER TABLE "ToolUsage" DROP CONSTRAINT "ToolUsage_toolId_fkey";

-- AlterTable
ALTER TABLE "Tool" ADD COLUMN     "badges" TEXT[],
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fullDescription" TEXT,
ADD COLUMN     "pricing" "PricingModel" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "problemSolved" TEXT,
ADD COLUMN     "relevance" TEXT[],
ADD COLUMN     "shortDescription" TEXT NOT NULL,
ADD COLUMN     "source" TEXT,
ADD COLUMN     "submittedById" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "usageContexts" TEXT[],
ADD COLUMN     "usageStatus" "ToolUsageStatus" NOT NULL DEFAULT 'COURSE_OFFICIAL',
DROP COLUMN "category",
ADD COLUMN     "category" "ToolCategory" NOT NULL DEFAULT 'OTHER';

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "branchId" TEXT,
ADD COLUMN     "mentorId" TEXT;

-- DropTable
DROP TABLE "ToolUsage";

-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtifactTool" (
    "id" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "artifactId" TEXT NOT NULL,
    "usageContext" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArtifactTool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToolSubmission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "category" "ToolCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "useCase" TEXT NOT NULL,
    "taskSolved" TEXT NOT NULL,
    "status" "ToolUsageStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "submittedById" TEXT NOT NULL,
    "reviewedById" TEXT,
    "reviewNotes" TEXT,
    "approvedToolId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ToolSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArtifactTool_toolId_artifactId_key" ON "ArtifactTool"("toolId", "artifactId");

-- CreateIndex
CREATE UNIQUE INDEX "ToolSubmission_approvedToolId_key" ON "ToolSubmission"("approvedToolId");

-- CreateIndex
CREATE UNIQUE INDEX "account_userId_providerId_key" ON "account"("userId", "providerId");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tool" ADD CONSTRAINT "Tool_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtifactTool" ADD CONSTRAINT "ArtifactTool_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtifactTool" ADD CONSTRAINT "ArtifactTool_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "Artifact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolSubmission" ADD CONSTRAINT "ToolSubmission_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolSubmission" ADD CONSTRAINT "ToolSubmission_approvedToolId_fkey" FOREIGN KEY ("approvedToolId") REFERENCES "Tool"("id") ON DELETE SET NULL ON UPDATE CASCADE;
