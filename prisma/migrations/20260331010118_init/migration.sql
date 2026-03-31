-- CreateTable
CREATE TABLE "OneOnOne" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "employeeName" TEXT NOT NULL,
    "materialHours" REAL NOT NULL,
    "materialCount" INTEGER NOT NULL,
    "workHours" REAL NOT NULL,
    "productionCount" INTEGER NOT NULL,
    "qualityCutEditing" INTEGER NOT NULL,
    "qualityColorGrading" INTEGER NOT NULL,
    "qualityTelop" INTEGER NOT NULL,
    "qualityBgmSe" INTEGER NOT NULL,
    "qualityOverallFlow" INTEGER NOT NULL,
    "lastMonthReview" TEXT NOT NULL,
    "thisMonthGoal" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "OneOnOne_year_month_employeeName_key" ON "OneOnOne"("year", "month", "employeeName");
