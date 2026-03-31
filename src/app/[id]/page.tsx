'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit2, Trash2, Save, X, Star, Plus, FileEdit, Send } from 'lucide-react'

interface VideoEvaluation {
  id: string
  videoTitle: string | null
  qualityCutEditing: number
  qualityColorGrading: number
  qualityTelop: number
  qualityBgmSe: number
  qualityOverallFlow: number
  createdAt: string
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
  subTaskMemo: string | null
  status: string
  lastMonthReview: string
  thisMonthGoal: string
  createdAt: string
  updatedAt: string
}

type VideoEvalForm = {
  videoTitle: string
  qualityCutEditing: number
  qualityColorGrading: number
  qualityTelop: number
  qualityBgmSe: number
  qualityOverallFlow: number
}

const qualityCriteria = [
  { key: 'qualityCutEditing' as keyof VideoEvaluation, label: 'カット編集の精度', description: 'テンポ・タイミングの正確さ、スムーズなつなぎ' },
  { key: 'qualityColorGrading' as keyof VideoEvaluation, label: 'カラーグレーディング', description: '色補正・映像の統一感、雰囲気の演出' },
  { key: 'qualityTelop' as keyof VideoEvaluation, label: 'テロップ・テキストデザイン', description: '可読性・デザイン性・タイミング' },
  { key: 'qualityBgmSe' as keyof VideoEvaluation, label: 'BGM・効果音の選定と調整', description: '音量バランス・選曲センス・効果音の自然さ' },
  { key: 'qualityOverallFlow' as keyof VideoEvaluation, label: '全体的な構成・流れ', description: 'ストーリー性・視聴者への伝わりやすさ' },
]

function videoAvg(v: VideoEvaluation | VideoEvalForm): number {
  return (
    (v.qualityCutEditing + v.qualityColorGrading + v.qualityTelop + v.qualityBgmSe + v.qualityOverallFlow) / 5
  )
}

function overallAvg(evals: VideoEvaluation[]): number {
  if (evals.length === 0) return 0
  return evals.reduce((sum, v) => sum + videoAvg(v), 0) / evals.length
}

function StarDisplay({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-4 h-4 ${s <= score ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
      ))}
      <span className="ml-1 text-sm font-semibold text-gray-700">{score.toFixed(1)}</span>
    </div>
  )
}

function ScoreSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          className={`w-9 h-9 rounded-full font-semibold text-sm transition border-2 ${
            value === s
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-400 hover:text-indigo-600'
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  )
}

function defaultVideoEval(): VideoEvalForm {
  return { videoTitle: '', qualityCutEditing: 3, qualityColorGrading: 3, qualityTelop: 3, qualityBgmSe: 3, qualityOverallFlow: 3 }
}

export default function RecordDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [record, setRecord] = useState<OneOnOne | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<Partial<OneOnOne>>({})
  const [videoEvals, setVideoEvals] = useState<VideoEvalForm[]>([])
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetch(`/api/records/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then((data) => {
        setRecord(data)
        setForm(data)
        setVideoEvals(
          data.videoEvaluations.map((v: VideoEvaluation) => ({
            videoTitle: v.videoTitle ?? '',
            qualityCutEditing: v.qualityCutEditing,
            qualityColorGrading: v.qualityColorGrading,
            qualityTelop: v.qualityTelop,
            qualityBgmSe: v.qualityBgmSe,
            qualityOverallFlow: v.qualityOverallFlow,
          }))
        )
        setLoading(false)
      })
      .catch(() => {
        setError('レコードが見つかりません')
        setLoading(false)
      })
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleVideoChange = (index: number, key: string, value: string | number) => {
    setVideoEvals((prev) => prev.map((v, i) => (i === index ? { ...v, [key]: value } : v)))
  }

  const addVideo = () => setVideoEvals((prev) => [...prev, defaultVideoEval()])
  const removeVideo = (index: number) => setVideoEvals((prev) => prev.filter((_, i) => i !== index))

  const handleSave = async () => {
    setSaving(true)
    setSaveError('')
    try {
      const res = await fetch(`/api/records/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, videoEvaluations: videoEvals }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSaveError(data.error || '更新に失敗しました')
        setSaving(false)
        return
      }
      setRecord(data)
      setForm(data)
      setVideoEvals(
        data.videoEvaluations.map((v: VideoEvaluation) => ({
          videoTitle: v.videoTitle ?? '',
          qualityCutEditing: v.qualityCutEditing,
          qualityColorGrading: v.qualityColorGrading,
          qualityTelop: v.qualityTelop,
          qualityBgmSe: v.qualityBgmSe,
          qualityOverallFlow: v.qualityOverallFlow,
        }))
      )
      setIsEditing(false)
    } catch {
      setSaveError('通信エラーが発生しました')
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    setPublishing(true)
    setSaveError('')
    try {
      const res = await fetch(`/api/records/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...record, videoEvaluations: record.videoEvaluations, status: 'PUBLISHED' }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSaveError(data.error || '公開に失敗しました')
        return
      }
      setRecord(data)
      setForm(data)
    } catch {
      setSaveError('通信エラーが発生しました')
    } finally {
      setPublishing(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/records/${id}`, { method: 'DELETE' })
      if (res.ok) router.push('/')
      else { setDeleting(false); setShowDeleteConfirm(false) }
    } catch {
      setDeleting(false)
    }
  }

  const handleCancelEdit = () => {
    setForm(record ?? {})
    setVideoEvals(
      (record?.videoEvaluations ?? []).map((v) => ({
        videoTitle: v.videoTitle ?? '',
        qualityCutEditing: v.qualityCutEditing,
        qualityColorGrading: v.qualityColorGrading,
        qualityTelop: v.qualityTelop,
        qualityBgmSe: v.qualityBgmSe,
        qualityOverallFlow: v.qualityOverallFlow,
      }))
    )
    setIsEditing(false)
    setSaveError('')
  }

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-400 text-lg">読み込み中...</p></div>
  }

  if (error || !record) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500 text-lg">{error || 'レコードが見つかりません'}</p>
        <Link href="/" className="text-indigo-600 hover:underline">ダッシュボードに戻る</Link>
      </div>
    )
  }

  const avg = overallAvg(record.videoEvaluations)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white shadow-md">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1 text-indigo-200 hover:text-white transition text-sm">
              <ArrowLeft className="w-4 h-4" />
              戻る
            </Link>
            <div className="border-l border-indigo-500 pl-3 flex items-center gap-2">
              <h1 className="text-xl font-bold">{record.employeeName} — {record.year}年{record.month}月</h1>
              {record.status === 'DRAFT' && (
                <span className="flex items-center gap-1 bg-amber-400/90 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
                  <FileEdit className="w-3 h-3" />下書き
                </span>
              )}
            </div>
          </div>
          {!isEditing && (
            <div className="flex items-center gap-2">
              {record.status === 'DRAFT' && (
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg transition text-sm font-semibold disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  {publishing ? '公開中...' : '公開する'}
                </button>
              )}
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition text-sm">
                <Edit2 className="w-4 h-4" />編集
              </button>
              <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-1.5 bg-red-500/80 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg transition text-sm">
                <Trash2 className="w-4 h-4" />削除
              </button>
            </div>
          )}
          {isEditing && (
            <div className="flex items-center gap-2">
              <button onClick={handleCancelEdit} className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition text-sm">
                <X className="w-4 h-4" />キャンセル
              </button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 bg-white text-indigo-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition text-sm disabled:opacity-60">
                <Save className="w-4 h-4" />{saving ? '保存中...' : '保存'}
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {saveError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{saveError}</div>
        )}

        {/* Basic Info */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-5 pb-2 border-b border-gray-100">基本情報</h2>
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">担当者名</label>
                <input type="text" name="employeeName" value={form.employeeName ?? ''} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">年</label>
                <select name="year" value={form.year ?? new Date().getFullYear()} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {years.map((y) => <option key={y} value={y}>{y}年</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">月</label>
                <select name="month" value={form.month ?? 1} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{m}月</option>)}
                </select>
              </div>
            </div>
          ) : (
            <dl className="grid grid-cols-3 gap-4">
              <div>
                <dt className="text-sm text-gray-500">担当者</dt>
                <dd className="mt-1 font-semibold text-gray-800">{record.employeeName}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">年月</dt>
                <dd className="mt-1 font-semibold text-gray-800">{record.year}年{record.month}月</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">平均スコア</dt>
                <dd className="mt-1 flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-gray-800">{avg.toFixed(1)}</span>
                  <span className="text-gray-400 text-sm">/ 5.0</span>
                </dd>
              </div>
            </dl>
          )}
        </section>

        {/* Work Metrics */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-5 pb-2 border-b border-gray-100">作業実績</h2>
          {isEditing ? (
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'materialHours', label: '素材動画の時間数（時間）', step: '0.1' },
                { name: 'materialCount', label: '素材動画の本数（本）', step: '1' },
                { name: 'workHours', label: '工数（時間）', step: '0.5' },
                { name: 'productionCount', label: '1ヶ月の制作本数（本）', step: '1' },
              ].map((f) => (
                <div key={f.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  <input
                    type="number"
                    name={f.name}
                    value={(form as Record<string, unknown>)[f.name] as number ?? ''}
                    onChange={handleChange}
                    step={f.step}
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: `${record.materialHours}h`, label: '素材動画の時間数' },
                { value: `${record.materialCount}本`, label: '素材動画の本数' },
                { value: `${record.workHours}h`, label: '工数' },
                { value: `${record.productionCount}本`, label: '制作本数' },
              ].map((item) => (
                <div key={item.label} className="text-center p-4 bg-indigo-50 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-700">{item.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{item.label}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Video Quality Evaluations */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-1 pb-2 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">動画別クオリティ評価</h2>
            <span className="text-sm text-gray-400">
              {isEditing ? videoEvals.length : record.videoEvaluations.length}本
            </span>
          </div>

          {isEditing ? (
            <div className="mt-5 space-y-4">
              <p className="text-sm text-gray-500">1（要改善）〜 5（非常に優秀）で評価してください</p>
              {videoEvals.map((ev, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-5 bg-gray-50 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-indigo-700 text-sm">動画 {i + 1}</span>
                    {videoEvals.length > 1 && (
                      <button type="button" onClick={() => removeVideo(i)} className="flex items-center gap-1 text-red-500 hover:text-red-700 text-sm transition">
                        <Trash2 className="w-4 h-4" />削除
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      動画タイトル <span className="text-gray-400 font-normal">（任意）</span>
                    </label>
                    <input
                      type="text"
                      value={ev.videoTitle}
                      onChange={(e) => handleVideoChange(i, 'videoTitle', e.target.value)}
                      placeholder="例: 商品紹介動画A"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>
                  <div className="space-y-3">
                    {qualityCriteria.map((c) => (
                      <div key={c.key} className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-800">{c.label}</div>
                          <div className="text-xs text-gray-400">{c.description}</div>
                        </div>
                        <ScoreSelector
                          value={ev[c.key as keyof VideoEvalForm] as number}
                          onChange={(v) => handleVideoChange(i, c.key, v)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addVideo}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-indigo-300 text-indigo-600 rounded-xl py-3 hover:bg-indigo-50 transition font-medium text-sm"
              >
                <Plus className="w-4 h-4" />動画を追加
              </button>
            </div>
          ) : record.videoEvaluations.length === 0 ? (
            <p className="mt-5 text-sm text-gray-400 text-center py-6">評価データがありません</p>
          ) : (
            <div className="mt-5 space-y-4">
              {record.videoEvaluations.map((v, i) => (
                <div key={v.id} className="border border-gray-100 rounded-xl p-5 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-xs text-indigo-600 font-semibold">動画 {i + 1}</span>
                      {v.videoTitle && (
                        <span className="ml-2 text-sm font-semibold text-gray-800">{v.videoTitle}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-bold text-gray-700">{videoAvg(v).toFixed(1)}</span>
                      <span className="text-xs text-gray-400">/ 5.0</span>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    {qualityCriteria.map((c) => (
                      <div key={c.key} className="flex items-center justify-between">
                        <div>
                          <span className="text-sm text-gray-700">{c.label}</span>
                          <span className="ml-2 text-xs text-gray-400 hidden sm:inline">{c.description}</span>
                        </div>
                        <StarDisplay score={v[c.key] as number} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {record.videoEvaluations.length > 1 && (
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="font-semibold text-gray-700">全体平均スコア</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-lg text-gray-800">{avg.toFixed(1)}</span>
                    <span className="text-gray-400 text-sm">/ 5.0</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Sub Task Memo */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-1 pb-2 border-b border-gray-100">サブ業務メモ</h2>
          {isEditing ? (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-3">動画編集以外の業務・作業内容を自由に記録してください</p>
              <textarea
                name="subTaskMemo"
                value={(form.subTaskMemo as string) ?? ''}
                onChange={handleChange}
                rows={4}
                placeholder="例: SNS投稿の文章作成、サムネイル制作、クライアントとの打ち合わせ対応 など"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          ) : record.subTaskMemo ? (
            <p className="mt-4 text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg p-4">
              {record.subTaskMemo}
            </p>
          ) : (
            <p className="mt-4 text-sm text-gray-400 italic">記録なし</p>
          )}
        </section>

        {/* Review & Goals */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-5 pb-2 border-b border-gray-100">振り返りと目標</h2>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">先月の振り返り</label>
                <textarea name="lastMonthReview" value={form.lastMonthReview ?? ''} onChange={handleChange} rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">今月の目標</label>
                <textarea name="thisMonthGoal" value={form.thisMonthGoal ?? ''} onChange={handleChange} rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-indigo-600 mb-2">先月の振り返り</h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg p-4">{record.lastMonthReview}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-indigo-600 mb-2">今月の目標</h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg p-4">{record.thisMonthGoal}</p>
              </div>
            </div>
          )}
        </section>

        {!isEditing && (
          <div className="text-xs text-gray-400 text-right">
            作成: {new Date(record.createdAt).toLocaleString('ja-JP')} ／
            更新: {new Date(record.updatedAt).toLocaleString('ja-JP')}
          </div>
        )}
      </main>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-2">削除の確認</h3>
            <p className="text-gray-600 mb-6">
              {record.employeeName}さんの {record.year}年{record.month}月 のレコードを削除しますか？この操作は元に戻せません。
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                キャンセル
              </button>
              <button onClick={handleDelete} disabled={deleting} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-60">
                <Trash2 className="w-4 h-4" />{deleting ? '削除中...' : '削除する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
