'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Star, Video, Clock, Calendar, LayoutDashboard, FileEdit } from 'lucide-react'

interface VideoEvaluation {
  qualityCutEditing: number
  qualityColorGrading: number
  qualityTelop: number
  qualityBgmSe: number
  qualityOverallFlow: number
}

interface OneOnOne {
  id: string
  year: number
  month: number
  employeeName: string
  materialHours: number
  materialCount: number
  workHours: number
  productionCount: number
  videoEvaluations: VideoEvaluation[]
  status: string
  lastMonthReview: string
  thisMonthGoal: string
  createdAt: string
  updatedAt: string
}

function averageQuality(record: OneOnOne): number {
  if (record.videoEvaluations.length === 0) return 0
  const total = record.videoEvaluations.reduce((sum, v) => {
    return sum + (v.qualityCutEditing + v.qualityColorGrading + v.qualityTelop + v.qualityBgmSe + v.qualityOverallFlow) / 5
  }, 0)
  return total / record.videoEvaluations.length
}

function StarRating({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${
            s <= Math.round(score)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          }`}
        />
      ))}
      <span className="ml-1 text-sm text-gray-600">{score.toFixed(1)}</span>
    </div>
  )
}

export default function DashboardPage() {
  const [records, setRecords] = useState<OneOnOne[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/records')
      .then((res) => res.json())
      .then((data) => {
        setRecords(data)
        setLoading(false)
      })
      .catch(() => {
        setError('データの読み込みに失敗しました')
        setLoading(false)
      })
  }, [])

  // Group by employee
  const grouped: Record<string, OneOnOne[]> = {}
  for (const record of records) {
    if (!grouped[record.employeeName]) {
      grouped[record.employeeName] = []
    }
    grouped[record.employeeName].push(record)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-700 text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">1on1 管理アプリ</h1>
            <p className="text-indigo-200 text-sm mt-0.5">動画編集チーム 月次面談記録</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-indigo-200 hover:text-white text-sm transition px-3 py-2 rounded-lg hover:bg-white/10"
            >
              <LayoutDashboard className="w-4 h-4" />
              ダッシュボード
            </Link>
            <Link
              href="/new"
              className="flex items-center gap-2 bg-white text-indigo-700 font-semibold px-4 py-2 rounded-lg hover:bg-indigo-50 transition"
            >
              <Plus className="w-5 h-5" />
              新規作成
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {loading && (
          <div className="text-center py-16 text-gray-400 text-lg">読み込み中...</div>
        )}
        {error && (
          <div className="text-center py-16 text-red-500">{error}</div>
        )}
        {!loading && !error && records.length === 0 && (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">まだ1on1レコードがありません</p>
            <Link
              href="/new"
              className="mt-4 inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              <Plus className="w-4 h-4" />
              最初のレコードを作成
            </Link>
          </div>
        )}

        {!loading && !error && Object.keys(grouped).length > 0 && (
          <div className="space-y-10">
            {Object.entries(grouped).map(([employeeName, empRecords]) => (
              <section key={employeeName}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                    {employeeName.charAt(0)}
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">{employeeName}</h2>
                  <span className="text-sm text-gray-400">{empRecords.length}件</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {empRecords.map((record) => {
                    const avg = averageQuality(record)
                    return (
                      <Link
                        key={record.id}
                        href={`/${record.id}`}
                        className="block bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition p-5"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-indigo-600 font-semibold text-lg">
                              {record.year}年{record.month}月
                            </span>
                            {record.status === 'DRAFT' && (
                              <span className="flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-200">
                                <FileEdit className="w-3 h-3" />下書き
                              </span>
                            )}
                          </div>
                          {record.videoEvaluations.length > 0 ? (
                            <StarRating score={avg} />
                          ) : (
                            <span className="text-xs text-gray-400">評価なし</span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Video className="w-4 h-4 text-indigo-400" />
                            <span>制作本数: <strong>{record.productionCount}</strong>本</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Clock className="w-4 h-4 text-indigo-400" />
                            <span>工数: <strong>{record.workHours}</strong>h</span>
                          </div>
                        </div>

                        {record.thisMonthGoal && (
                          <p className="mt-3 text-xs text-gray-500 line-clamp-2 border-t border-gray-50 pt-2">
                            <span className="font-medium text-gray-600">目標: </span>
                            {record.thisMonthGoal}
                          </p>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
