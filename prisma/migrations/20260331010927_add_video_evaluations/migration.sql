/*
  Warnings:

  - You are about to drop the column `qualityBgmSe` on the `OneOnOne` table. All the data in the column will be lost.
  - You are about to drop the column `qualityColorGrading` on the `OneOnOne` table. All the data in the column will be lost.
  - You are about to drop the column `qualityCutEditing` on the `OneOnOne` table. All the data in the column will be lost.
  - You are about to drop the column `qualityOverallFlow` on the `OneOnOne` table. All the data in the column will be lost.
  - You are about to drop the column `qualityTelop` on the `OneOnOne` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "VideoEvaluation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "oneOnOneId" TEXT NOT NULL,
    "videoTitle" TEXT,
    "qualityCutEditing" INTEGER NOT NULL,
    "qualityColorGrading" INTEGER NOT NULL,
    "qualityTelop" INTEGER NOT NULL,
    "qualityBgmSe" INTEGER NOT NULL,
    "qualityOverallFlow" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VideoEvaluation_oneOnOneId_fkey" FOREIGN KEY ("oneOnOneId") REFERENCES "OneOnOne" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OneOnOne" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "employeeName" TEXT NOT NULL,
    "materialHours" REAL NOT NULL,
    "materialCount" INTEGER NOT NULL,
    "workHours" REAL NOT NULL,
    "productionCount" INTEGER NOT NULL,
    "lastMonthReview" TEXT NOT NULL,
    "thisMonthGoal" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_OneOnOne" ("createdAt", "employeeName", "id", "lastMonthReview", "materialCount", "materialHours", "month", "productionCount", "thisMonthGoal", "updatedAt", "workHours", "year") SELECT "createdAt", "employeeName", "id", "lastMonthReview", "materialCount", "materialHours", "month", "productionCount", "thisMonthGoal", "updatedAt", "workHours", "year" FROM "OneOnOne";
DROP TABLE "OneOnOne";
ALTER TABLE "new_OneOnOne" RENAME TO "OneOnOne";
CREATE UNIQUE INDEX "OneOnOne_year_month_employeeName_key" ON "OneOnOne"("year", "month", "employeeName");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
