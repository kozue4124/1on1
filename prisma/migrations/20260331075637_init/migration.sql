-- CreateTable
CREATE TABLE "OneOnOne" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "employeeName" TEXT NOT NULL,
    "materialHours" DOUBLE PRECISION NOT NULL,
    "materialCount" INTEGER NOT NULL,
    "workHours" DOUBLE PRECISION NOT NULL,
    "productionCount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "subTaskMemo" TEXT,
    "lastMonthReview" TEXT NOT NULL,
    "thisMonthGoal" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OneOnOne_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoEvaluation" (
    "id" TEXT NOT NULL,
    "oneOnOneId" TEXT NOT NULL,
    "videoTitle" TEXT,
    "qualityCutEditing" INTEGER NOT NULL,
    "qualityColorGrading" INTEGER NOT NULL,
    "qualityTelop" INTEGER NOT NULL,
    "qualityBgmSe" INTEGER NOT NULL,
    "qualityOverallFlow" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OneOnOne_year_month_employeeName_key" ON "OneOnOne"("year", "month", "employeeName");

-- AddForeignKey
ALTER TABLE "VideoEvaluation" ADD CONSTRAINT "VideoEvaluation_oneOnOneId_fkey" FOREIGN KEY ("oneOnOneId") REFERENCES "OneOnOne"("id") ON DELETE CASCADE ON UPDATE CASCADE;
