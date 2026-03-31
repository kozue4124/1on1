'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Users,
  CalendarDays,
  Star,
  Video,
  TrendingUp,
  ChevronRight,
  Clock,
  Plus,
  LayoutDashboard,
  FileEdit,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

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
  workHours: number
  productionCount: number
  videoEvaluations: VideoEvaluation[]
  status: string
  lastMonthReview: string
  thisMonthGoal: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const qualityCriteria = [
  { key: 'qualityCutEditing', label: 'カット編集の精度' },
  { key: 'qualityColorGrading', label: 'カラーグレーディング' },
  { key: 'qualityTelop', label: 'テロップ・テキストデザイン' },
  { key: 'qualityBgmSe', label: 'BGM・効果音の選定と調整' },
  { key: 'qualityOverallFlow', label: '全体的な構成・流れ' },
]

function recordAvg(r: OneOnOne): number {
  if (!r.videoEvaluations.length) return 0
  const sum = r.videoEvaluations.reduce(
    (s, v) =>
      s + (v.qualityCutEditing + v.qualityColorGrading + v.qualityTelop + v.qualityBgmSe + v.qualityOverallFlow) / 5,
    0
  )
  return sum / r.videoEvaluations.length
}

function ym(year: number, month: number) {
  return `${year}/${String(month).padStart(2, '0')}`
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

function KpiCard({
  icon,
  label,
  value,
  unit,
  bg,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  unit: string
  bg: string
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${bg}`}>{icon}</div>
      <div className="text-2xl font-bold text-gray-800">
        {value}
        <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>
      </div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  )
}

// ─── Score Trend Line Chart (SVG) ─────────────────────────────────────────────

function ScoreTrendChart({ records }: { records: OneOnOne[] }) {
  const W = 480
  const H = 160
  const PAD = { top: 24, right: 16, bottom: 36, left: 36 }
  const cW = W - PAD.left - PAD.right
  const cH = H - PAD.top - PAD.bottom

  const pts = [...records]
    .filter((r) => r.videoEvaluations.length > 0)
    .sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month))
    .map((r) => ({ label: ym(r.year, r.month), v: recordAvg(r) }))

  if (pts.length === 0)
    return <div className="flex items-center justify-center h-full text-gray-300 text-sm">評価データなし</div>

  const toX = (i: number) => PAD.left + (pts.length === 1 ? cW / 2 : (i / (pts.length - 1)) * cW)
  const toY = (v: number) => PAD.top + cH - (v / 5) * cH

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(p.v)}`).join(' ')
  const areaPath = `${linePath} L ${toX(pts.length - 1)} ${H - PAD.bottom} L ${toX(0)} ${H - PAD.bottom} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
      {/* Y grid lines */}
      {[1, 2, 3, 4, 5].map((v) => (
        <g key={v}>
          <line x1={PAD.left} y1={toY(v)} x2={W - PAD.right} y2={toY(v)} stroke="#f3f4f6" strokeWidth="1.5" />
          <text x={PAD.left - 6} y={toY(v) + 4} textAnchor="end" fontSize="10" fill="#d1d5db">
            {v}
          </text>
        </g>
      ))}

      {/* Area */}
      {pts.length > 1 && <path d={areaPath} fill="#4f46e5" fillOpacity="0.07" />}

      {/* Line */}
      {pts.length > 1 && (
        <path d={linePath} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      )}

      {/* Dots + labels */}
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={toX(i)} cy={toY(p.v)} r="5" fill="white" stroke="#4f46e5" strokeWidth="2.5" />
          <text x={toX(i)} y={toY(p.v) - 10} textAnchor="middle" fontSize="11" fill="#4338ca" fontWeight="bold">
            {p.v.toFixed(1)}
          </text>
          <text x={toX(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="#9ca3af">
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  )
}

// ─── Production Bar Chart (SVG) ───────────────────────────────────────────────

function ProductionBarChart({ records }: { records: OneOnOne[] }) {
  const W = 480
  const H = 160
  const PAD = { top: 24, right: 16, bottom: 36, left: 36 }
  const cW = W - PAD.left - PAD.right
  const cH = H - PAD.top - PAD.bottom

  const sorted = [...records].sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month))

  if (sorted.length === 0)
    return <div className="flex items-center justify-center h-full text-gray-300 text-sm">データなし</div>

  const maxV = Math.max(...sorted.map((r) => r.productionCount), 1)
  const slot = cW / sorted.length
  const barW = Math.min(slot * 0.55, 36)

  const toX = (i: number) => PAD.left + i * slot + slot / 2
  const barH = (v: number) => (v / maxV) * cH

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
      {/* Y grid lines */}
      {[0.25, 0.5, 0.75, 1].map((f) => {
        const y = PAD.top + cH - f * cH
        return (
          <g key={f}>
            <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#f3f4f6" strokeWidth="1.5" />
            <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#d1d5db">
              {Math.round(maxV * f)}
            </text>
          </g>
        )
      })}

      {/* Bars */}
      {sorted.map((r, i) => {
        const h = barH(r.productionCount)
        const x = toX(i) - barW / 2
        const y = PAD.top + cH - h
        return (
          <g key={r.id}>
            <rect x={x} y={y} width={barW} height={h} rx="4" fill="#6366f1" fillOpacity="0.75" />
            <text x={toX(i)} y={y - 5} textAnchor="middle" fontSize="11" fill="#4338ca" fontWeight="bold">
              {r.productionCount}
            </text>
            <text x={toX(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="#9ca3af">
              {ym(r.year, r.month)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── Work Hours Bar Chart (SVG) ───────────────────────────────────────────────

function WorkHoursChart({ records }: { records: OneOnOne[] }) {
  const W = 480
  const H = 160
  const PAD = { top: 24, right: 16, bottom: 36, left: 36 }
  const cW = W - PAD.left - PAD.right
  const cH = H - PAD.top - PAD.bottom

  const sorted = [...records].sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month))

  if (sorted.length === 0)
    return <div className="flex items-center justify-center h-full text-gray-300 text-sm">データなし</div>

  const maxV = Math.max(...sorted.map((r) => r.workHours), 1)
  const slot = cW / sorted.length
  const barW = Math.min(slot * 0.55, 36)

  const toX = (i: number) => PAD.left + i * slot + slot / 2
  const barH = (v: number) => (v / maxV) * cH

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
      {[0.25, 0.5, 0.75, 1].map((f) => {
        const y = PAD.top + cH - f * cH
        return (
          <g key={f}>
            <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#f3f4f6" strokeWidth="1.5" />
            <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#d1d5db">
              {Math.round(maxV * f)}
            </text>
          </g>
        )
      })}

      {sorted.map((r, i) => {
        const h = barH(r.workHours)
        const x = toX(i) - barW / 2
        const y = PAD.top + cH - h
        return (
          <g key={r.id}>
            <rect x={x} y={y} width={barW} height={h} rx="4" fill="#8b5cf6" fillOpacity="0.7" />
            <text x={toX(i)} y={y - 5} textAnchor="middle" fontSize="11" fill="#7c3aed" fontWeight="bold">
              {r.workHours}
            </text>
            <text x={toX(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="#9ca3af">
              {ym(r.year, r.month)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── Score Color ──────────────────────────────────────────────────────────────

function scoreColor(v: number) {
  if (v >= 4.5) return 'text-emerald-600'
  if (v >= 3.5) return 'text-indigo-600'
  if (v >= 2.5) return 'text-amber-600'
  return 'text-red-500'
}

function scoreBg(v: number) {
  if (v >= 4.5) return 'from-emerald-500 to-emerald-400'
  if (v >= 3.5) return 'from-indigo-500 to-indigo-400'
  if (v >= 2.5) return 'from-amber-500 to-amber-400'
  return 'from-red-500 to-red-400'
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [records, setRecords] = useState<OneOnOne[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEmp, setSelectedEmp] = useState<string>('all')

  useEffect(() => {
    fetch('/api/records')
      .then((r) => r.json())
      .then((data) => {
        setRecords(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const employees = useMemo(() => [...new Set(records.map((r) => r.employeeName))].sort(), [records])

  const filtered = useMemo(
    () => (selectedEmp === 'all' ? records : records.filter((r) => r.employeeName === selectedEmp)),
    [records, selectedEmp]
  )

  // ── KPIs ──
  const totalEmps = employees.length
  const totalSessions = records.length
  const allAvgs = records.filter((r) => r.videoEvaluations.length > 0).map(recordAvg)
  const overallAvg = allAvgs.length ? allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length : 0
  const totalProduction = records.reduce((s, r) => s + r.productionCount, 0)

  // ── Criteria averages (for selected employee/all) ──
  const criteriaAvgs = qualityCriteria.map((c) => {
    const vals = filtered.flatMap((r) => r.videoEvaluations.map((v) => v[c.key as keyof VideoEvaluation] as number))
    return { ...c, avg: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0 }
  })

  // ── Sorted records (latest first) ──
  const sortedRecords = [...filtered].sort((a, b) =>
    a.year !== b.year ? b.year - a.year : b.month - a.month
  )

  // ── Per-employee summary for comparison table ──
  const empSummaries = employees.map((name) => {
    const empRecs = records.filter((r) => r.employeeName === name)
    const avgs = empRecs.filter((r) => r.videoEvaluations.length > 0).map(recordAvg)
    const avg = avgs.length ? avgs.reduce((a, b) => a + b, 0) / avgs.length : 0
    const latest = [...empRecs].sort((a, b) => (a.year !== b.year ? b.year - a.year : b.month - a.month))[0]
    return {
      name,
      sessions: empRecs.length,
      avg,
      totalProd: empRecs.reduce((s, r) => s + r.productionCount, 0),
      latestMonth: latest ? `${latest.year}/${latest.month}月` : '—',
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-700 text-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-6 h-6 text-indigo-300" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">ダッシュボード</h1>
              <p className="text-indigo-200 text-sm mt-0.5">動画編集チーム 1on1 分析・集計</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-indigo-200 hover:text-white text-sm transition px-3 py-1.5 rounded-lg hover:bg-white/10">
              記録一覧
            </Link>
            <Link
              href="/new"
              className="flex items-center gap-2 bg-white text-indigo-700 font-semibold px-4 py-2 rounded-lg hover:bg-indigo-50 transition text-sm"
            >
              <Plus className="w-4 h-4" />
              新規作成
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {loading ? (
          <div className="text-center py-20 text-gray-400 text-lg">読み込み中...</div>
        ) : records.length === 0 ? (
          <div className="text-center py-20">
            <CalendarDays className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">まだ記録がありません</p>
            <Link href="/new" className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition">
              最初の記録を作成
            </Link>
          </div>
        ) : (
          <>
            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard
                icon={<Users className="w-5 h-5 text-indigo-600" />}
                label="従業員数"
                value={totalEmps}
                unit="名"
                bg="bg-indigo-50"
              />
              <KpiCard
                icon={<CalendarDays className="w-5 h-5 text-violet-600" />}
                label="総 1on1 回数"
                value={totalSessions}
                unit="回"
                bg="bg-violet-50"
              />
              <KpiCard
                icon={<Star className="w-5 h-5 text-amber-500" />}
                label="全体平均スコア"
                value={overallAvg.toFixed(2)}
                unit="/ 5"
                bg="bg-amber-50"
              />
              <KpiCard
                icon={<Video className="w-5 h-5 text-emerald-600" />}
                label="累計制作本数"
                value={totalProduction}
                unit="本"
                bg="bg-emerald-50"
              />
            </div>

            {/* ── Employee Comparison (if 2+ employees) ── */}
            {employees.length > 1 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-500" />
                  従業員別サマリー
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left pb-2 text-gray-500 font-medium">担当者</th>
                        <th className="text-right pb-2 text-gray-500 font-medium">1on1回数</th>
                        <th className="text-right pb-2 text-gray-500 font-medium">直近記録</th>
                        <th className="text-right pb-2 text-gray-500 font-medium">累計制作本数</th>
                        <th className="text-right pb-2 text-gray-500 font-medium">平均スコア</th>
                        <th className="pb-2 text-gray-500 font-medium pl-4">スコア</th>
                      </tr>
                    </thead>
                    <tbody>
                      {empSummaries
                        .sort((a, b) => b.avg - a.avg)
                        .map((e) => (
                          <tr
                            key={e.name}
                            className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition"
                            onClick={() => setSelectedEmp(e.name)}
                          >
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                                  {e.name.charAt(0)}
                                </div>
                                <span className="font-medium text-gray-800">{e.name}</span>
                              </div>
                            </td>
                            <td className="py-3 text-right text-gray-600">{e.sessions} 回</td>
                            <td className="py-3 text-right text-gray-600">{e.latestMonth}</td>
                            <td className="py-3 text-right text-gray-600">{e.totalProd} 本</td>
                            <td className={`py-3 text-right font-bold ${scoreColor(e.avg)}`}>
                              {e.avg > 0 ? e.avg.toFixed(2) : '—'}
                            </td>
                            <td className="py-3 pl-4 w-28">
                              {e.avg > 0 && (
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full bg-gradient-to-r ${scoreBg(e.avg)} rounded-full`}
                                    style={{ width: `${(e.avg / 5) * 100}%` }}
                                  />
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Employee Filter Tabs ── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-400 mr-1">絞り込み:</span>
                {['all', ...employees].map((emp) => (
                  <button
                    key={emp}
                    onClick={() => setSelectedEmp(emp)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                      selectedEmp === emp
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
                    }`}
                  >
                    {emp === 'all' ? '全員' : emp}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Charts Row ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Score Trend */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-800 mb-0.5 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  クオリティスコア推移
                </h3>
                <p className="text-xs text-gray-400 mb-4">月別平均スコア（5点満点）</p>
                <div className="h-40">
                  <ScoreTrendChart records={filtered} />
                </div>
              </div>

              {/* Production Count */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-800 mb-0.5 flex items-center gap-2">
                  <Video className="w-4 h-4 text-indigo-500" />
                  月次制作本数
                </h3>
                <p className="text-xs text-gray-400 mb-4">1ヶ月あたりの制作本数</p>
                <div className="h-40">
                  <ProductionBarChart records={filtered} />
                </div>
              </div>

              {/* Work Hours */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-800 mb-0.5 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-violet-500" />
                  月次工数推移
                </h3>
                <p className="text-xs text-gray-400 mb-4">1ヶ月あたりの工数（時間）</p>
                <div className="h-40">
                  <WorkHoursChart records={filtered} />
                </div>
              </div>

              {/* Criteria Breakdown */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-800 mb-0.5 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  評価項目別 平均スコア
                </h3>
                <p className="text-xs text-gray-400 mb-4">
                  {selectedEmp === 'all' ? '全員' : selectedEmp}の評価項目平均
                </p>
                <div className="space-y-3 mt-1">
                  {criteriaAvgs.map((c) => (
                    <div key={c.key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-700">{c.label}</span>
                        <span className={`text-xs font-bold ${scoreColor(c.avg)}`}>
                          {c.avg > 0 ? c.avg.toFixed(2) : '—'}
                          <span className="text-gray-300 font-normal"> / 5</span>
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${scoreBg(c.avg)} rounded-full transition-all duration-700`}
                          style={{ width: c.avg > 0 ? `${(c.avg / 5) * 100}%` : '0%' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Records Table ── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-gray-800">
                  記録一覧
                  <span className="ml-2 text-sm font-normal text-gray-400">{sortedRecords.length} 件</span>
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left pb-3 text-gray-500 font-medium">年月</th>
                      <th className="text-left pb-3 text-gray-500 font-medium">担当者</th>
                      <th className="text-right pb-3 text-gray-500 font-medium">評価動画数</th>
                      <th className="text-right pb-3 text-gray-500 font-medium">制作本数</th>
                      <th className="text-right pb-3 text-gray-500 font-medium">工数 (h)</th>
                      <th className="text-right pb-3 text-gray-500 font-medium">平均スコア</th>
                      <th className="pb-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRecords.map((r) => {
                      const avg = recordAvg(r)
                      return (
                        <tr key={r.id} className="border-b border-gray-50 hover:bg-indigo-50/30 transition">
                          <td className="py-3">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-indigo-600">{r.year}年{r.month}月</span>
                              {r.status === 'DRAFT' && (
                                <span className="flex items-center gap-0.5 bg-amber-100 text-amber-700 text-xs font-bold px-1.5 py-0.5 rounded-full border border-amber-200">
                                  <FileEdit className="w-2.5 h-2.5" />下書き
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                                {r.employeeName.charAt(0)}
                              </div>
                              <span className="text-gray-800">{r.employeeName}</span>
                            </div>
                          </td>
                          <td className="py-3 text-right text-gray-600">{r.videoEvaluations.length} 本</td>
                          <td className="py-3 text-right text-gray-600">{r.productionCount} 本</td>
                          <td className="py-3 text-right text-gray-600">{r.workHours} h</td>
                          <td className="py-3 text-right">
                            {r.videoEvaluations.length > 0 ? (
                              <span className={`flex items-center justify-end gap-1 font-bold ${scoreColor(avg)}`}>
                                <Star className="w-3.5 h-3.5 fill-current" />
                                {avg.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-gray-300 text-xs">評価なし</span>
                            )}
                          </td>
                          <td className="py-3 text-right">
                            <Link href={`/${r.id}`} className="text-gray-300 hover:text-indigo-500 transition">
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
