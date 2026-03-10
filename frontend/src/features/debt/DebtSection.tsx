import { useEffect, useRef, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip } from 'recharts'
import { CreditCard, Activity, TrendingDown, Plus, X, Upload, FileText, CheckCircle2 } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { AddButton } from '../../components/ui/AddButton'
import { useFinanceStore } from '../../store/useFinanceStore'
import { fmt, fmtK, COLORS } from '../../lib/utils'

const debtColors = [COLORS.primary, COLORS.purple, COLORS.rose, COLORS.rose, COLORS.mint]

const DEBT_TYPES = ['Mortgage', 'Credit Card', 'Personal Loan', 'Student Loan', 'Auto Loan', 'Other']

type ModalStep = 'pick' | 'manual' | 'upload'

interface DebtForm {
  name: string
  type: string
  balance: number
  monthly: number
  rate: number
}

const emptyForm = (): DebtForm => ({ name: '', type: 'Credit Card', balance: 0, monthly: 0, rate: 0 })

export function DebtSection() {
  const dashboard = useFinanceStore((s) => s.dashboard)
  const fetchDashboard = useFinanceStore((s) => s.fetchDashboard)

  useEffect(() => {
    if (!dashboard) fetchDashboard()
  }, [dashboard, fetchDashboard])

  const [modalStep, setModalStep] = useState<ModalStep | null>(null)
  const [form, setForm] = useState<DebtForm>(emptyForm())
  const [dragOver, setDragOver] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadParsed, setUploadParsed] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function openModal() { setModalStep('pick'); setForm(emptyForm()); setUploadedFile(null); setUploadParsed(false) }
  function closeModal() { setModalStep(null) }

  function handleFile(file: File) {
    setUploadedFile(file)
    // Simulate parsing delay
    setTimeout(() => setUploadParsed(true), 1200)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const debtItems = dashboard?.debtItems ?? []
  const isEmpty = debtItems.length === 0
  const total = debtItems.reduce((a, d) => a + d.balance, 0)
  const monthly = debtItems.reduce((a, d) => a + d.monthly, 0)
  const dd = debtItems.map((d, i) => ({
    name: d.name,
    v: d.balance,
    c: debtColors[i],
  }))

  return (
    <>
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="Total Debt"
          value={fmtK(total)}
          change={isEmpty ? 0 : -3.2}
          note={isEmpty ? '—' : 'vs last yr'}
          color={COLORS.rose}
          Icon={CreditCard}
        />
        <StatCard
          label="Monthly Payments"
          value={fmt(monthly)}
          change={0}
          note={isEmpty ? '—' : 'unchanged'}
          color={COLORS.amber}
          Icon={Activity}
        />
        <StatCard
          label="Avg Interest Rate"
          value={isEmpty ? '—' : '6.2%'}
          change={isEmpty ? 0 : -0.4}
          note={isEmpty ? '—' : 'vs last yr'}
          color={COLORS.mint}
          Icon={TrendingDown}
        />
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_262px]">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold text-[#0d1117]">
              Debt Accounts
            </div>
            <AddButton label="Add Debt" color={COLORS.rose} onClick={openModal} />
          </div>
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#cae7ee]"
                style={{ background: `${COLORS.rose}12` }}
              >
                <CreditCard size={26} style={{ color: COLORS.rose }} />
              </div>
              <div className="text-center">
                <div className="text-[13px] font-semibold text-[#0d1117]">
                  No debt accounts yet
                </div>
                <div className="mt-1 text-[12px] text-[#7a9fad]">
                  Track mortgages, credit cards, loans and more
                </div>
              </div>
              <button
                type="button"
                onClick={openModal}
                className="mt-1 flex items-center gap-1.5 rounded-lg px-4 py-2 text-[12px] font-semibold text-white transition-opacity hover:opacity-80"
                style={{ background: COLORS.rose }}
              >
                <Plus size={13} />
                Add your first debt
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {debtItems.map((d, i) => {
                const rc =
                  d.rate > 15 ? COLORS.rose : d.rate > 8 ? COLORS.amber : COLORS.primary
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl border border-[#cae7ee] bg-[#f0f8fa] px-4 py-3"
                  >
                    <div
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-[rgba(0,0,0,0.13)]"
                      style={{ background: `${rc}12` }}
                    >
                      <CreditCard size={14} style={{ color: rc }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold text-[#0d1117]">
                        {d.name}
                      </div>
                      <div className="mt-0.5 text-[11px] text-[#7a9fad]">
                        {d.type}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[13px] font-bold text-[#0d1117]">
                        {fmt(d.balance)}
                      </div>
                      <div className="mt-0.5 text-[11px] text-[#7a9fad]">
                        {fmt(d.monthly)}/mo
                      </div>
                    </div>
                    <div
                      className="flex-shrink-0 rounded-lg border px-2.5 py-1"
                      style={{
                        background: `${rc}12`,
                        borderColor: `${rc}22`,
                      }}
                    >
                      <span className="text-[12px] font-bold" style={{ color: rc }}>
                        {d.rate}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
        <Card className="flex flex-col gap-3">
          <div className="text-sm font-semibold text-[#0d1117]">
            Breakdown
          </div>
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8">
              <div
                className="flex h-[150px] w-[150px] items-center justify-center rounded-full border-4 border-dashed"
                style={{ borderColor: `${COLORS.rose}30` }}
              >
                <span className="text-[11px] text-[#b0c8d0]">No data</span>
              </div>
            </div>
          ) : (
            <>
              <PieChart width={204} height={150}>
                <Pie
                  data={dd}
                  cx={102}
                  cy={70}
                  innerRadius={40}
                  outerRadius={64}
                  dataKey="v"
                  paddingAngle={3}
                >
                  {dd.map((e, i) => (
                    <Cell key={i} fill={e.c} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: COLORS.card,
                    border: `1.5px solid ${COLORS.border}`,
                    borderRadius: 10,
                    fontSize: 12,
                    padding: '8px 12px',
                  }}
                  formatter={(v) => (v != null ? [fmt(Number(v))] : null)}
                />
              </PieChart>
              <div className="flex flex-col gap-1.5">
                {dd.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div
                      className="h-2 w-2 flex-shrink-0 rounded-sm"
                      style={{ background: d.c }}
                    />
                    <span className="flex-1 text-[11px] text-[#3a5260]">
                      {d.name}
                    </span>
                    <span className="text-[11px] font-semibold text-[#0d1117]">
                      {Math.round((d.v / total) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
          <div className="rounded-xl border border-[#cae7ee] bg-[#f0f8fa] p-3 text-center">
            <div className="text-[10px] uppercase tracking-wider text-[#7a9fad]">
              Debt-to-Asset Ratio
            </div>
            <div className="text-2xl font-bold text-[#d4860a]">
              {(dashboard?.stats.totalAssets ?? 0) > 0 && total > 0
                ? ((total / (dashboard?.stats.totalAssets ?? 1)) * 100).toFixed(1)
                : 0}%
            </div>
            <div className="mt-1 text-[11px] text-[#7a9fad]">
              Healthy: below 35%
            </div>
          </div>
        </Card>
      </div>
    </div>

      {/* ── Add Debt Modal ── */}
      {modalStep !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(13,17,23,0.45)' }}
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl"
            style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-4 top-4 rounded-full p-1 transition-colors hover:bg-[#cae7ee]/40"
            >
              <X size={16} style={{ color: COLORS.textDim }} />
            </button>

            {/* ── Step 1: Pick method ── */}
            {modalStep === 'pick' && (
              <>
                <div className="mb-6">
                  <div className="text-base font-semibold text-[#0d1117]">Add Debt Account</div>
                  <div className="mt-0.5 text-[11px] text-[#7a9fad]">How would you like to add your debt?</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setModalStep('manual')}
                    className="flex flex-col items-center gap-3 rounded-xl border-2 px-4 py-6 transition-all hover:shadow-md"
                    style={{ borderColor: `${COLORS.rose}40`, background: `${COLORS.rose}08` }}
                  >
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{ background: `${COLORS.rose}18` }}
                    >
                      <CreditCard size={22} style={{ color: COLORS.rose }} />
                    </div>
                    <div className="text-center">
                      <div className="text-[13px] font-semibold text-[#0d1117]">Manual Entry</div>
                      <div className="mt-0.5 text-[11px] text-[#7a9fad]">Fill in details yourself</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalStep('upload')}
                    className="flex flex-col items-center gap-3 rounded-xl border-2 px-4 py-6 transition-all hover:shadow-md"
                    style={{ borderColor: `${COLORS.primary}40`, background: `${COLORS.primary}08` }}
                  >
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{ background: `${COLORS.primary}18` }}
                    >
                      <Upload size={22} style={{ color: COLORS.primary }} />
                    </div>
                    <div className="text-center">
                      <div className="text-[13px] font-semibold text-[#0d1117]">Upload File</div>
                      <div className="mt-0.5 text-[11px] text-[#7a9fad]">Import from bank export</div>
                    </div>
                  </button>
                </div>
                <p className="mt-4 text-center text-[11px] text-[#b0c8d0]">
                  Supported file types: CSV, OFX, QFX, PDF
                </p>
              </>
            )}

            {/* ── Step 2a: Manual Entry form ── */}
            {modalStep === 'manual' && (
              <>
                <div className="mb-5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalStep('pick')}
                    className="rounded-lg px-2 py-1 text-[11px] text-[#7a9fad] hover:bg-[#f0f8fa]"
                  >
                    ← Back
                  </button>
                  <div>
                    <div className="text-base font-semibold text-[#0d1117]">Manual Entry</div>
                    <div className="mt-0.5 text-[11px] text-[#7a9fad]">Enter your debt account details</div>
                  </div>
                </div>
                <form
                  onSubmit={(e) => { e.preventDefault(); closeModal() }}
                  className="flex flex-col gap-3.5"
                >
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-[#7a9fad]">Account Name</label>
                    <input
                      required
                      className="rounded-lg border px-3 py-2 text-[13px] outline-none focus:border-[#55b2c9]"
                      style={{ borderColor: COLORS.border, background: '#f7fcfd', color: '#0d1117' }}
                      placeholder="e.g. Chase Sapphire Card"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-[#7a9fad]">Debt Type</label>
                    <select
                      className="rounded-lg border px-3 py-2 text-[13px] outline-none focus:border-[#55b2c9]"
                      style={{ borderColor: COLORS.border, background: '#f7fcfd', color: '#0d1117' }}
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                    >
                      {DEBT_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold uppercase tracking-wide text-[#7a9fad]">Balance ($)</label>
                      <input
                        required
                        type="number"
                        min={0}
                        step="any"
                        className="rounded-lg border px-3 py-2 text-[13px] outline-none focus:border-[#55b2c9]"
                        style={{ borderColor: COLORS.border, background: '#f7fcfd', color: '#0d1117' }}
                        placeholder="0.00"
                        value={form.balance || ''}
                        onChange={(e) => setForm({ ...form, balance: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold uppercase tracking-wide text-[#7a9fad]">Monthly ($)</label>
                      <input
                        required
                        type="number"
                        min={0}
                        step="any"
                        className="rounded-lg border px-3 py-2 text-[13px] outline-none focus:border-[#55b2c9]"
                        style={{ borderColor: COLORS.border, background: '#f7fcfd', color: '#0d1117' }}
                        placeholder="0.00"
                        value={form.monthly || ''}
                        onChange={(e) => setForm({ ...form, monthly: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-[#7a9fad]">Interest Rate (%)</label>
                    <input
                      required
                      type="number"
                      min={0}
                      max={100}
                      step="0.01"
                      className="rounded-lg border px-3 py-2 text-[13px] outline-none focus:border-[#55b2c9]"
                      style={{ borderColor: COLORS.border, background: '#f7fcfd', color: '#0d1117' }}
                      placeholder="e.g. 19.99"
                      value={form.rate || ''}
                      onChange={(e) => setForm({ ...form, rate: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  {form.balance > 0 && form.rate > 0 && (
                    <div
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-[12px]"
                      style={{ background: `${COLORS.rose}10`, border: `1px solid ${COLORS.rose}28` }}
                    >
                      <span style={{ color: COLORS.textDim }}>Est. annual interest</span>
                      <span className="font-semibold" style={{ color: COLORS.rose }}>
                        {fmt((form.balance * form.rate) / 100)}
                      </span>
                    </div>
                  )}
                  <div className="mt-1 flex gap-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 rounded-lg border px-4 py-2 text-[13px] font-semibold text-[#0d1117] transition-colors hover:bg-[#f0f8fa]"
                      style={{ borderColor: COLORS.border }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-lg px-4 py-2 text-[13px] font-semibold text-white"
                      style={{ background: COLORS.rose }}
                    >
                      Add Debt
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* ── Step 2b: Upload File ── */}
            {modalStep === 'upload' && (
              <>
                <div className="mb-5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setModalStep('pick'); setUploadedFile(null); setUploadParsed(false) }}
                    className="rounded-lg px-2 py-1 text-[11px] text-[#7a9fad] hover:bg-[#f0f8fa]"
                  >
                    ← Back
                  </button>
                  <div>
                    <div className="text-base font-semibold text-[#0d1117]">Upload Bank File</div>
                    <div className="mt-0.5 text-[11px] text-[#7a9fad]">Import debt data from your bank export</div>
                  </div>
                </div>

                {!uploadedFile ? (
                  <>
                    <div
                      className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors"
                      style={{
                        borderColor: dragOver ? COLORS.primary : `${COLORS.primary}40`,
                        background: dragOver ? `${COLORS.primary}08` : '#f7fcfd',
                      }}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl"
                        style={{ background: `${COLORS.primary}18` }}
                      >
                        <Upload size={22} style={{ color: COLORS.primary }} />
                      </div>
                      <div className="text-center">
                        <div className="text-[13px] font-semibold text-[#0d1117]">Drop your file here</div>
                        <div className="mt-0.5 text-[11px] text-[#7a9fad]">or click to browse</div>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".csv,.ofx,.qfx,.pdf"
                        onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
                      />
                    </div>
                    <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                      {['CSV', 'OFX', 'QFX', 'PDF'].map((ext) => (
                        <span
                          key={ext}
                          className="rounded-md border px-2 py-0.5 text-[11px] font-semibold"
                          style={{ borderColor: COLORS.border, color: COLORS.textDim, background: '#f0f8fa' }}
                        >
                          .{ext}
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 text-center text-[11px] text-[#b0c8d0]">
                      We accept exports from Chase, Bank of America, Wells Fargo, Citi, and most major banks.
                    </p>
                  </>
                ) : !uploadParsed ? (
                  <div className="flex flex-col items-center gap-3 py-8">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{ background: `${COLORS.primary}18` }}
                    >
                      <FileText size={22} style={{ color: COLORS.primary }} />
                    </div>
                    <div className="text-center">
                      <div className="text-[13px] font-semibold text-[#0d1117]">{uploadedFile.name}</div>
                      <div className="mt-1 text-[11px] text-[#7a9fad]">Parsing file…</div>
                    </div>
                    <div className="h-1.5 w-40 overflow-hidden rounded-full bg-[#e4f2f5]">
                      <div
                        className="h-full rounded-full bg-[#55b2c9] transition-all"
                        style={{ width: '60%', animation: 'pulse 1s ease-in-out infinite' }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 rounded-xl border border-[#cae7ee] bg-[#f0f8fa] px-4 py-3">
                      <CheckCircle2 size={18} style={{ color: '#1cb08a' }} />
                      <div>
                        <div className="text-[12px] font-semibold text-[#0d1117]">{uploadedFile.name}</div>
                        <div className="text-[11px] text-[#7a9fad]">File parsed successfully</div>
                      </div>
                    </div>
                    <div
                      className="rounded-xl border p-4 text-[12px]"
                      style={{ borderColor: `${COLORS.primary}30`, background: `${COLORS.primary}06` }}
                    >
                      <div className="mb-2 font-semibold text-[#0d1117]">Detected accounts</div>
                      {[
                        { name: 'Chase Freedom Card', type: 'Credit Card', balance: 3420, rate: 24.99 },
                        { name: 'Student Loan – Federal', type: 'Student Loan', balance: 18500, rate: 5.05 },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between border-t border-[#cae7ee] py-2">
                          <div>
                            <div className="font-medium text-[#0d1117]">{item.name}</div>
                            <div className="text-[#7a9fad]">{item.type}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-[#0d1117]">{fmt(item.balance)}</div>
                            <div style={{ color: COLORS.rose }}>{item.rate}% APR</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => { setUploadedFile(null); setUploadParsed(false) }}
                        className="flex-1 rounded-lg border px-4 py-2 text-[13px] font-semibold text-[#0d1117] hover:bg-[#f0f8fa]"
                        style={{ borderColor: COLORS.border }}
                      >
                        Re-upload
                      </button>
                      <button
                        type="button"
                        onClick={closeModal}
                        className="flex-1 rounded-lg px-4 py-2 text-[13px] font-semibold text-white"
                        style={{ background: COLORS.primary }}
                      >
                        Import All
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
