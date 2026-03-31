import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const record = await prisma.oneOnOne.findUnique({
      where: { id },
      include: { videoEvaluations: { orderBy: { createdAt: 'asc' } } },
    })

    if (!record) {
      return NextResponse.json({ error: 'レコードが見つかりません' }, { status: 404 })
    }

    return NextResponse.json(record)
  } catch (error) {
    console.error('Error fetching record:', error)
    return NextResponse.json({ error: 'レコードの取得に失敗しました' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
      status,
    } = body

    const record = await prisma.oneOnOne.update({
      where: { id },
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
        ...(status ? { status } : {}),
        videoEvaluations: {
          deleteMany: {},
          create: (videoEvaluations ?? []).map((v: {
            videoTitle?: string
            workHours?: number | string
            qualityCutEditing: number
            qualityColorGrading: number
            qualityTelop: number
            qualityBgmSe: number
            qualityOverallFlow: number
          }) => ({
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
      include: { videoEvaluations: { orderBy: { createdAt: 'asc' } } },
    })

    return NextResponse.json(record)
  } catch (error: unknown) {
    console.error('Error updating record:', error)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'この年月・担当者のレコードはすでに存在します' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: 'レコードの更新に失敗しました' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.oneOnOne.delete({ where: { id } })
    return NextResponse.json({ message: 'レコードを削除しました' })
  } catch (error) {
    console.error('Error deleting record:', error)
    return NextResponse.json({ error: 'レコードの削除に失敗しました' }, { status: 500 })
  }
}
