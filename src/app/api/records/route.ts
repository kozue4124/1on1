import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const records = await prisma.oneOnOne.findMany({
      include: { videoEvaluations: true },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    })
    return NextResponse.json(records)
  } catch (error) {
    console.error('Error fetching records:', error)
    return NextResponse.json({ error: 'レコードの取得に失敗しました' }, { status: 500 })
  }
}

type VideoEvalInput = {
  videoTitle?: string
  workHours?: number | string
  qualityCutEditing: number
  qualityColorGrading: number
  qualityTelop: number
  qualityBgmSe: number
  qualityOverallFlow: number
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      year,
      month,
      employeeName,
      materialHours,
      materialCount,
      workHours,
      productionCount,
      videoEvaluations,
      subTaskMemo,
      lastMonthReview,
      thisMonthGoal,
      status = 'PUBLISHED',
    } = body

    const isDraft = status === 'DRAFT'

    const record = await prisma.oneOnOne.create({
      data: {
        year: Number(year),
        month: Number(month),
        employeeName,
        materialHours: Number(materialHours) || 0,
        materialCount: Number(materialCount) || 0,
        workHours: Number(workHours) || 0,
        productionCount: Number(productionCount) || 0,
        subTaskMemo: subTaskMemo || null,
        lastMonthReview: lastMonthReview || '',
        thisMonthGoal: thisMonthGoal || '',
        status: isDraft ? 'DRAFT' : 'PUBLISHED',
        videoEvaluations: {
          create: (videoEvaluations ?? []).map((v: VideoEvalInput) => ({
            videoTitle: v.videoTitle || null,
            workHours: v.workHours !== undefined && v.workHours !== '' ? Number(v.workHours) : null,
            qualityCutEditing: Number(v.qualityCutEditing),
            qualityColorGrading: Number(v.qualityColorGrading),
            qualityTelop: Number(v.qualityTelop),
            qualityBgmSe: Number(v.qualityBgmSe),
            qualityOverallFlow: Number(v.qualityOverallFlow),
          })),
        },
      },
      include: { videoEvaluations: true },
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating record:', error)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'この年月・担当者のレコードはすでに存在します' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'レコードの作成に失敗しました' }, { status: 500 })
  }
}
