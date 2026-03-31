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
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "subTaskMemo" TEXT,
    "lastMonthReview" TEXT NOT NULL,
    "thisMonthGoal" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_OneOnOne" ("createdAt", "employeeName", "id", "lastMonthReview", "materialCount", "materialHours", "month", "productionCount", "subTaskMemo", "thisMonthGoal", "updatedAt", "workHours", "year") SELECT "createdAt", "employeeName", "id", "lastMonthReview", "materialCount", "materialHours", "month", "productionCount", "subTaskMemo", "thisMonthGoal", "updatedAt", "workHours", "year" FROM "OneOnOne";
DROP TABLE "OneOnOne";
ALTER TABLE "new_OneOnOne" RENAME TO "OneOnOne";
CREATE UNIQUE INDEX "OneOnOne_year_month_employeeName_key" ON "OneOnOne"("year", "month", "employeeName");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
