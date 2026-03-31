'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Plus, Trash2, FileEdit } from 'lucide-react'

const qualityCriteria = [
  { key: 'qualityCutEditing', label: 'カット編集の精度', description: 'テンポ・タイミングの正確さ、スムーズなつなぎ' },
  { key: 'qualityColorGrading', label: 'カラーグレーディング', description: '色補正・映像の統一感、雰囲気の演出' },
  { key: 'qualityTelop', label: 'テロップ・テキストデザイン', description: '可読性・デザイン性・タイミング' },
  { key: 'qualityBgmSe', label: 'BGM・効果音の選定と調整', description: '音量バランス・選曲センス・効果音の自然さ' },
  { key: 'qualityOverallFlow', label: '全体的な構成・流れ', description: 'ストーリー性・視聴者への伝わりやすさ' },
]

type VideoEvalForm = {
  videoTitle: string
  workHours: string
  qualityCutEditing: number
  qualityColorGrading: number
  qualityTelop: number
  qualityBgmSe: number
  qualityOverallFlow: number
}

function defaultVideoEval(): VideoEvalForm {
  return {
    videoTitle: '',
    workHours: '',
    qualityCutEditing: 3,
    qualityColorGrading: 3,
    qualityTelop: 3,
    qualityBgmSe: 3,
    qualityOverallFlow: 3,
  }
}

function ScoreSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-2">
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

function VideoEvalCard({
  index,
  eval: ev,
  onChange,
  onRemove,
  canRemove,
}: {
  index: number
  eval: VideoEvalForm
  onChange: (key: string, value: string | number) => void
  onRemove: () => void
  canRemove: boolean
}) {
  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-gray-50 space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-indigo-700 text-sm">動画 {index + 1}</span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="flex items-center gap-1 text-red-500 hover:text-red-700 text-sm transition"
          >
            <Trash2 className="w-4 h-4" />
            削除
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            動画タイトル <span className="text-gray-400 font-normal">（任意）</span>
          </label>
          <input
            type="text"
            value={ev.videoTitle}
            onChange={(e) => onChange('videoTitle', e.target.value)}
            placeholder="例: 商品紹介動画A"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            工数 <span className="text-gray-400 font-normal">（時間・任意）</span>
          </label>
          <input
            type="number"
            value={ev.workHours}
            onChange={(e) => onChange('workHours', e.target.value)}
            min="0"
            step="0.5"
            placeholder="例: 8"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
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
              onChange={(v) => onChange(c.key, v)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth() + 1

export default function NewRecordPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    employeeName: '',
    year: currentYear,
    month: currentMonth,
    materialHours: '',
    materialCount: '',
    workHours: '',
    productionCount: '',
    subTaskMemo: '',
    lastMonthReview: '',
    thisMonthGoal: '',
  })
  const [videoEvals, setVideoEvals] = useState<VideoEvalForm[]>([defaultVideoEval()])
  const [submitting, setSubmitting] = useState(false)
  const [draftSaving, setDraftSaving] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleVideoChange = (index: number, key: string, value: string | number) => {
    setVideoEvals((prev) => prev.map((v, i) => (i === index ? { ...v, [key]: value } : v)))
  }

  const addVideo = () => setVideoEvals((prev) => [...prev, defaultVideoEval()])

  const removeVideo = (index: number) =>
    setVideoEvals((prev) => prev.filter((_, i) => i !== index))

  const saveRecord = async (status: 'PUBLISHED' | 'DRAFT') => {
    const res = await fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, videoEvaluations: videoEvals, status }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || '作成に失敗しました')
    return data
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const data = await saveRecord('PUBLISHED')
      router.push(`/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '通信エラーが発生しました')
      setSubmitting(false)
    }
  }

  const handleDraftSave = async () => {
    if (!form.employeeName.trim()) {
      setError('担当者名は必須です')
      return
    }
    setDraftSaving(true)
    setError('')
    try {
      const data = await saveRecord('DRAFT')
      router.push(`/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '通信エラーが発生しました')
      setDraftSaving(false)
    }
  }

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white shadow-md">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1 text-indigo-200 hover:text-white transition text-sm">
            <ArrowLeft className="w-4 h-4" />
            戻る
          </Link>
          <div className="border-l border-indigo-500 pl-3">
            <h1 className="text-xl font-bold">新規 1on1 記録作成</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-5 pb-2 border-b border-gray-100">基本情報</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  担当者名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="employeeName"
                  value={form.employeeName}
                  onChange={handleChange}
                  required
                  placeholder="例: 山田 太郎"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  年 <span className="text-red-500">*</span>
                </label>
                <select
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {years.map((y) => <option key={y} value={y}>{y}年</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  月 <span className="text-red-500">*</span>
                </label>
                <select
                  name="month"
                  value={form.month}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>{m}月</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Work Metrics */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-5 pb-2 border-b border-gray-100">作業実績</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  素材動画の時間数（時間）<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="materialHours"
                  value={form.materialHours}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.1"
                  placeholder="例: 12.5"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  素材動画の本数（本）<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="materialCount"
                  value={form.materialCount}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="例: 8"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  工数（時間）<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="workHours"
                  value={form.workHours}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.5"
                  placeholder="例: 40"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  1ヶ月の制作本数（本）<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="productionCount"
                  value={form.productionCount}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="例: 6"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </section>

          {/* Video Quality Evaluations */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-1 pb-2 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">動画別クオリティ評価</h2>
              <span className="text-sm text-gray-400">{videoEvals.length}本</span>
            </div>
            <p className="text-sm text-gray-500 mb-5">1（要改善）〜 5（非常に優秀）で評価してください</p>

            <div className="space-y-4">
              {videoEvals.map((ev, i) => (
                <VideoEvalCard
                  key={i}
                  index={i}
                  eval={ev}
                  onChange={(key, value) => handleVideoChange(i, key, value)}
                  onRemove={() => removeVideo(i)}
                  canRemove={videoEvals.length > 1}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={addVideo}
              className="mt-4 w-full flex items-center justify-center gap-2 border-2 border-dashed border-indigo-300 text-indigo-600 rounded-xl py-3 hover:bg-indigo-50 transition font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              動画を追加
            </button>
          </section>

          {/* Sub Task Memo */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-1 pb-2 border-b border-gray-100">サブ業務メモ</h2>
            <p className="text-sm text-gray-500 mb-4">動画編集以外の業務・作業内容を自由に記録してください</p>
            <textarea
              name="subTaskMemo"
              value={form.subTaskMemo}
              onChange={handleChange}
              rows={4}
              placeholder="例: SNS投稿の文章作成、サムネイル制作、クライアントとの打ち合わせ対応 など"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </section>

          {/* Review & Goals */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-5 pb-2 border-b border-gray-100">振り返りと目標</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  先月の振り返り <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="lastMonthReview"
                  value={form.lastMonthReview}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="先月の振り返りを記入してください..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  今月の目標 <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="thisMonthGoal"
                  value={form.thisMonthGoal}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="今月の目標を記入してください..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
            </div>
          </section>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end flex-wrap">
            <Link
              href="/"
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
            >
              キャンセル
            </Link>
            <button
              type="button"
              onClick={handleDraftSave}
              disabled={draftSaving || submitting}
              className="flex items-center gap-2 border border-gray-400 text-gray-600 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-60"
            >
              <FileEdit className="w-4 h-4" />
              {draftSaving ? '保存中...' : '下書き保存'}
            </button>
            <button
              type="submit"
              disabled={submitting || draftSaving}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {submitting ? '保存中...' : '保存する'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
