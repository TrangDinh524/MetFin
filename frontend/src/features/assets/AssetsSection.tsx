import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, ArrowUpRight, Activity, Plus, X, Pencil, Trash2 } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { AddButton } from '../../components/ui/AddButton'
import { fmt, fmtK, COLORS } from '../../lib/utils'
import type { SectorItem } from '../../types'
import type { HoldingCreateInput } from '../../lib/api'
import { useFinanceStore } from '../../store/useFinanceStore'

export function AssetsSection() {
  const section = useFinanceStore((s) => s.section)
  const subPage = section.startsWith('assets-') ? section.replace('assets-', '') : 'public'
  const [active, setActive] = useState(subPage)

  const investments = useFinanceStore((s) => s.investments)
  const banking = useFinanceStore((s) => s.banking)
  const crypto = useFinanceStore((s) => s.crypto)
  const fetchInvestments = useFinanceStore((s) => s.fetchInvestments)
  const fetchBanking = useFinanceStore((s) => s.fetchBanking)
  const fetchCrypto = useFinanceStore((s) => s.fetchCrypto)
  const addHolding = useFinanceStore((s) => s.addHolding)
  const updateHolding = useFinanceStore((s) => s.updateHolding)
  const deleteHolding = useFinanceStore((s) => s.deleteHolding)

  const [showAddModal, setShowAddModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editingHolding, setEditingHolding] = useState<{ id: string } & HoldingCreateInput | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const emptyForm = (): HoldingCreateInput => (
    { name: '', ticker: '', shares: 0, currentPrice: 0, costBasis: 0, sector: 'Tech' }
  )
  const [form, setForm] = useState<HoldingCreateInput>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  function openEditModal(h: typeof holdings[number]) {
    setEditingHolding({ id: h.id, name: h.name, ticker: h.ticker, shares: h.shares, currentPrice: h.currentPrice, costBasis: h.costBasis, sector: h.sector })
    setForm({ name: h.name, ticker: h.ticker, shares: h.shares, currentPrice: h.currentPrice, costBasis: h.costBasis, sector: h.sector })
    setAddError(null)
  }

  async function handleAddHolding(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setAddError(null)
    try {
      await addHolding(form)
      setShowAddModal(false)
      setForm(emptyForm())
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to add holding. Is the backend running?')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdateHolding(e: React.FormEvent) {
    e.preventDefault()
    if (!editingHolding) return
    setSubmitting(true)
    setAddError(null)
    try {
      await updateHolding(editingHolding.id, form)
      setEditingHolding(null)
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to update. Is the backend running?')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    fetchInvestments()
    fetchBanking()
    fetchCrypto()
  }, [fetchInvestments, fetchBanking, fetchCrypto])

  // Build tabs from live data (fallback to 0)
  const invTotal = investments?.summary.totalValue ?? 0
  const bankTotal = banking?.summary.totalBalance ?? 0
  const cryptoTotal = crypto?.summary.totalValue ?? 0

  const assetTabs = [
    { id: 'public', label: 'Public Investments', total: fmtK(invTotal) },
    { id: 'digital', label: 'Digital Assets', total: fmtK(cryptoTotal) },
    { id: 'bank', label: 'Bank Deposits', total: fmtK(bankTotal) },
  ]

  // Sector breakdown from investments API
  const sectorColors: Record<string, string> = {
    Technology: COLORS.primary,
    Bonds: COLORS.mint,
    ETF: COLORS.purple,
    Other: COLORS.amber,
  }
  const sectors: SectorItem[] = investments
    ? Object.entries(investments.summary.sectors).map(([n, v]) => ({
        n,
        v,
        c: sectorColors[n] ?? COLORS.amber,
      }))
    : []

  const holdings = investments?.holdings ?? []

  const currentTab = assetTabs.find((t) => t.id === active)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 overflow-x-auto pb-0.5">
        {assetTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t.id)}
            className="flex flex-shrink-0 flex-col items-start gap-0.5 rounded-xl border px-4 py-2 text-left text-[12px] transition-all"
            style={{
              background: active === t.id ? COLORS.primary : COLORS.card,
              color: active === t.id ? '#fff' : COLORS.textDim,
              borderColor: active === t.id ? COLORS.primary : COLORS.border,
              fontWeight: active === t.id ? 600 : 400,
              boxShadow: active === t.id ? '0 2px 8px rgba(85,178,201,0.25)' : 'none',
            }}
          >
            <span>{t.label}</span>
            <span
              className="text-[11px] font-medium"
              style={{
                color: active === t.id ? 'rgba(255,255,255,0.72)' : COLORS.textMuted,
              }}
            >
              {t.total}
            </span>
          </button>
        ))}
      </div>

      {active === 'public' ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Portfolio Value"
              value={fmtK(investments?.summary.totalValue ?? 0)}
              change={investments?.summary.allTimeGainPct ?? 0}
              note="YTD"
              color={COLORS.primary}
              Icon={TrendingUp}
            />
            <StatCard
              label="Today's Gain"
              value={`${(investments?.summary.todayGain ?? 0) >= 0 ? '+' : ''}${fmt(investments?.summary.todayGain ?? 0)}`}
              change={investments?.summary.todayGainPct ?? 0}
              note="today"
              color={COLORS.mint}
              Icon={ArrowUpRight}
            />
            <StatCard
              label="All-Time Gain"
              value={`${(investments?.summary.allTimeGain ?? 0) >= 0 ? '+' : ''}${fmt(investments?.summary.allTimeGain ?? 0)}`}
              change={investments?.summary.allTimeGainPct ?? 0}
              note="total"
              color={COLORS.purple}
              Icon={Activity}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_252px]">
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm font-semibold text-[#0d1117]">
                  Holdings
                </div>
                <div className="flex items-center gap-2">
                  {holdings.length > 0 && (
                    <button
                      type="button"
                      onClick={() => { setEditMode((v) => !v); setConfirmDeleteId(null) }}
                      className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-semibold transition-colors"
                      style={{
                        borderColor: editMode ? COLORS.primary : COLORS.border,
                        color: editMode ? COLORS.primary : COLORS.textDim,
                        background: editMode ? `${COLORS.primary}10` : 'transparent',
                      }}
                    >
                      <Pencil size={12} />
                      Edit Holding
                    </button>
                  )}
                  <AddButton label="Add Holding" color={COLORS.primary} onClick={() => setShowAddModal(true)} />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[#cae7ee]">
                      {['Asset', 'Ticker', 'Shares', 'Value', 'Gain / Loss', 'Sector', ...(editMode ? [''] : [])].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-2.5 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wider text-[#7a9fad]"
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((h) => {
                      const isConfirming = confirmDeleteId === h.id
                      return (
                        <tr
                          key={h.id}
                          className="border-b border-[#cae7ee]/30 transition-colors hover:bg-[#f0f8fa]"
                          style={isConfirming ? { background: `${COLORS.rose}06` } : {}}
                        >
                          <td className="px-2.5 py-2.5 text-[13px] font-medium text-[#0d1117]">
                            {h.name}
                          </td>
                          <td className="px-2.5 py-2.5">
                            <span className="rounded-md border border-[#cae7ee] bg-[rgba(85,178,201,0.10)] px-2 py-0.5 text-[11px] font-bold text-[#3d96ad]">
                              {h.ticker}
                            </span>
                          </td>
                          <td className="px-2.5 py-2.5 text-[12px] text-[#3a5260]">
                            {h.shares}
                          </td>
                          <td className="px-2.5 py-2.5 text-[13px] font-semibold text-[#0d1117]">
                            {fmt(h.value)}
                          </td>
                          <td className="px-2.5 py-2.5">
                            <span
                              className={`text-[12px] font-bold ${h.gainPct >= 0 ? 'text-[#1cb08a]' : 'text-[#d44a4a]'}`}
                            >
                              {h.gainPct >= 0 ? '+' : ''}
                              {h.gainPct}%
                            </span>
                          </td>
                          <td className="px-2.5 py-2.5">
                            <span className="rounded-md bg-[#cae7ee] px-2 py-0.5 text-[11px] text-[#3a5260]">
                              {h.sector}
                            </span>
                          </td>
                          {editMode && (
                            <td className="px-2.5 py-2.5">
                              {isConfirming ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[11px] text-[#7a9fad]">Delete?</span>
                                  <button
                                    type="button"
                                    disabled={deleting}
                                    onClick={async () => {
                                      setDeleting(true)
                                      try {
                                        await deleteHolding(h.id)
                                        setConfirmDeleteId(null)
                                      } finally { setDeleting(false) }
                                    }}
                                    className="rounded-lg px-2 py-0.5 text-[11px] font-semibold text-white disabled:opacity-60"
                                    style={{ background: COLORS.rose }}
                                  >
                                    {deleting ? '…' : 'Yes'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="rounded-lg border px-2 py-0.5 text-[11px] font-semibold"
                                    style={{ borderColor: COLORS.border, color: COLORS.textDim }}
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => openEditModal(h)}
                                    className="flex h-7 w-7 items-center justify-center rounded-lg border transition-colors hover:bg-[#e4f2f5]"
                                    style={{ borderColor: COLORS.border }}
                                    title="Edit"
                                  >
                                    <Pencil size={13} style={{ color: COLORS.primary }} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(h.id)}
                                    className="flex h-7 w-7 items-center justify-center rounded-lg border transition-colors hover:bg-[#fdecea]"
                                    style={{ borderColor: COLORS.border }}
                                    title="Delete"
                                  >
                                    <Trash2 size={13} style={{ color: COLORS.rose }} />
                                  </button>
                                </div>
                              )}
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
            <Card className="flex flex-col gap-3">
              <div className="text-sm font-semibold text-[#0d1117]">
                Sector Breakdown
              </div>
              <PieChart width={196} height={148}>
                <Pie
                  data={sectors}
                  cx={98}
                  cy={68}
                  innerRadius={38}
                  outerRadius={62}
                  dataKey="v"
                  paddingAngle={3}
                >
                  {sectors.map((s, i) => (
                    <Cell key={i} fill={s.c} />
                  ))}
                </Pie>
              </PieChart>
              <div className="flex flex-col gap-2">
                {sectors.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-1.5">
                      <div
                        className="h-2 w-2 rounded-sm"
                        style={{ background: s.c }}
                      />
                      <span className="text-[11px] text-[#3a5260]">{s.n}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-[#0d1117]">
                      {s.v}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      ) : (
        <Card className="flex flex-col items-center gap-3 p-14">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#cae7ee]"
            style={{ background: COLORS.primarySoft }}
          >
            <Plus size={22} style={{ color: COLORS.primary }} />
          </div>
          <div className="text-[15px] font-semibold text-[#0d1117]">
            {currentTab?.label}
          </div>
          <p className="max-w-[300px] text-center text-[12px] leading-relaxed text-[#3a5260]">
            Connect an account via API or add assets manually to start tracking
            this category.
          </p>
          <div className="mt-1 flex gap-2">
            <button
              type="button"
              className="rounded-lg border-none bg-[#55b2c9] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_2px_8px_rgba(85,178,201,0.28)]"
            >
              Connect API
            </button>
            <button
              type="button"
              className="rounded-lg border border-[#cae7ee] bg-white px-5 py-2.5 text-[13px] font-semibold text-[#0d1117]"
            >
              Manual Entry
            </button>
          </div>
        </Card>
      )}

      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(13,17,23,0.45)' }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl"
            style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 rounded-full p-1 transition-colors hover:bg-[#cae7ee]/40"
            >
              <X size={16} style={{ color: COLORS.textDim }} />
            </button>

            <div className="mb-5">
              <div className="text-base font-semibold text-[#0d1117]">Add Holding</div>
              <div className="mt-0.5 text-[11px] text-[#7a9fad]">Manually record a public investment</div>
            </div>

            <form onSubmit={handleAddHolding} className="flex flex-col gap-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 flex flex-col gap-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-[#7a9fad]">Asset Name</label>
                  <input
                    required
                    className="rounded-lg border px-3 py-2 text-[13px] outline-none"
                    style={{ borderColor: COLORS.border, background: '#f7fcfd', color: '#0d1117' }}
                    placeholder="e.g. Apple Inc."
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-[#7a9fad]">Ticker</label>
                  <input
                    required
                    className="rounded-lg border px-3 py-2 text-[13px] font-bold uppercase outline-none"
                    style={{ borderColor: COLORS.border, background: '#f7fcfd', color: COLORS.primary }}
                    placeholder="AAPL"
                    value={form.ticker}
                    onChange={(e) => setForm({ ...form, ticker: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-[#7a9fad]">Sector</label>
                  <select
                    className="rounded-lg border px-3 py-2 text-[13px] outline-none"
                    style={{ borderColor: COLORS.border, background: '#f7fcfd', color: '#0d1117' }}
                    value={form.sector}
                    onChange={(e) => setForm({ ...form, sector: e.target.value })}
                  >
                    {['Tech', 'ETF', 'Bonds', 'Finance', 'Healthcare', 'Energy', 'Other'].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-[#7a9fad]">Shares</label>
                  <input
                    required
                    type="number"
                    min={0}
                    step="any"
                    className="rounded-lg border px-3 py-2 text-[13px] outline-none"
                    style={{ borderColor: COLORS.border, background: '#f7fcfd', color: '#0d1117' }}
                    placeholder="0"
                    value={form.shares || ''}
                    onChange={(e) => setForm({ ...form, shares: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-[#7a9fad]">Price / Share ($)</label>
                  <input
                    required
                    type="number"
                    min={0}
                    step="any"
                    className="rounded-lg border px-3 py-2 text-[13px] outline-none"
                    style={{ borderColor: COLORS.border, background: '#f7fcfd', color: '#0d1117' }}
                    placeholder="0.00"
                    value={form.currentPrice || ''}
                    onChange={(e) => setForm({ ...form, currentPrice: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="col-span-2 flex flex-col gap-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-[#7a9fad]">Total Cost Basis ($)</label>
                  <input
                    required
                    type="number"
                    min={0}
                    step="any"
                    className="rounded-lg border px-3 py-2 text-[13px] outline-none"
                    style={{ borderColor: COLORS.border, background: '#f7fcfd', color: '#0d1117' }}
                    placeholder="0.00"
                    value={form.costBasis || ''}
                    onChange={(e) => setForm({ ...form, costBasis: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              {form.shares > 0 && form.currentPrice > 0 && (
                <div
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-[12px]"
                  style={{ background: `${COLORS.primary}12`, border: `1px solid ${COLORS.primary}30` }}
                >
                  <span style={{ color: COLORS.textDim }}>Estimated Value</span>
                  <span className="font-semibold" style={{ color: COLORS.primary }}>
                    {fmt(form.shares * form.currentPrice)}
                  </span>
                </div>
              )}

              {addError && (
                <div
                  className="rounded-lg px-3 py-2 text-[12px]"
                  style={{ background: '#fdecea', color: '#b91c1c', border: '1px solid #fca5a5' }}
                >
                  {addError}
                </div>
              )}

              <div className="mt-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setAddError(null) }}
                  className="flex-1 rounded-lg border px-4 py-2 text-[13px] font-semibold text-[#0d1117] transition-colors hover:bg-[#f0f8fa]"
                  style={{ borderColor: COLORS.border }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-lg px-4 py-2 text-[13px] font-semibold text-white shadow-[0_2px_8px_rgba(85,178,201,0.28)] disabled:opacity-60"
                  style={{ background: COLORS.primary }}
                >
                  {submitting ? 'Adding…' : 'Add Holding'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Holding Modal ── */}
      {editingHolding && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(13,17,23,0.45)' }}
          onClick={() => setEditingHolding(null)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl"
            style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setEditingHolding(null)}
              className="absolute right-4 top-4 rounded-full p-1 transition-colors hover:bg-[#cae7ee]/40"
            >
              <X size={16} style={{ color: COLORS.textDim }} />
            </button>
            <div className="mb-5">
              <div className="text-base font-semibold text-[#0d1117]">Edit Holding</div>
              <div className="mt-0.5 text-[11px] text-[#7a9fad]">Update your investment details</div>
            </div>
            <form onSubmit={handleUpdateHolding} className="flex flex-col gap-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 flex flex-col gap-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-[#7a9fad]">Asset Name</label>
                  <input
                    required
                    className="rounded-lg border px-3 py-2 text-[13px] outline-none"
                    style={{ borderColor: COLORS.border, background: '#f7fcfd', color: '#0d1117' }}
                    placeholder="e.g. Apple Inc."
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-[#7a9fad]">Ticker</label>
                  <input
                    required
                    className="rounded-lg border px-3 py-2 text-[13px] font-bold uppercase outline-none"
                    style={{ borderColor: COLORS.border, background: '#f7fcfd', color: COLORS.primary }}
                    placeholder="AAPL"
                    value={form.ticker}
                    onChange={(e) => setForm({ ...form, ticker: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-[#7a9fad]">Sector</label>
                  <select
                    className="rounded-lg border px-3 py-2 text-[13px] outline-none"
                    style={{ borderColor: COLORS.border, background: '#f7fcfd', color: '#0d1117' }}
                    value={form.sector}
                    onChange={(e) => setForm({ ...form, sector: e.target.value })}
                  >
                    {['Tech', 'ETF', 'Bonds', 'Finance', 'Healthcare', 'Energy', 'Other'].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-[#7a9fad]">Shares</label>
                  <input
                    required
                    type="number"
                    min={0}
                    step="any"
                    className="rounded-lg border px-3 py-2 text-[13px] outline-none"
                    style={{ borderColor: COLORS.border, background: '#f7fcfd', color: '#0d1117' }}
                    placeholder="0"
                    value={form.shares || ''}
                    onChange={(e) => setForm({ ...form, shares: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-[#7a9fad]">Price / Share ($)</label>
                  <input
                    required
                    type="number"
                    min={0}
                    step="any"
                    className="rounded-lg border px-3 py-2 text-[13px] outline-none"
                    style={{ borderColor: COLORS.border, background: '#f7fcfd', color: '#0d1117' }}
                    placeholder="0.00"
                    value={form.currentPrice || ''}
                    onChange={(e) => setForm({ ...form, currentPrice: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="col-span-2 flex flex-col gap-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-[#7a9fad]">Total Cost Basis ($)</label>
                  <input
                    required
                    type="number"
                    min={0}
                    step="any"
                    className="rounded-lg border px-3 py-2 text-[13px] outline-none"
                    style={{ borderColor: COLORS.border, background: '#f7fcfd', color: '#0d1117' }}
                    placeholder="0.00"
                    value={form.costBasis || ''}
                    onChange={(e) => setForm({ ...form, costBasis: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              {form.shares > 0 && form.currentPrice > 0 && (
                <div
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-[12px]"
                  style={{ background: `${COLORS.primary}12`, border: `1px solid ${COLORS.primary}30` }}
                >
                  <span style={{ color: COLORS.textDim }}>Estimated Value</span>
                  <span className="font-semibold" style={{ color: COLORS.primary }}>
                    {fmt(form.shares * form.currentPrice)}
                  </span>
                </div>
              )}
              {addError && (
                <div
                  className="rounded-lg px-3 py-2 text-[12px]"
                  style={{ background: '#fdecea', color: '#b91c1c', border: '1px solid #fca5a5' }}
                >
                  {addError}
                </div>
              )}
              <div className="mt-1 flex gap-2">
                <button
                  type="button"
                  disabled={deleting || submitting}
                  onClick={async () => {
                    setDeleting(true)
                    try {
                      await deleteHolding(editingHolding.id)
                      setEditingHolding(null)
                    } finally { setDeleting(false) }
                  }}
                  className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] font-semibold transition-colors hover:bg-[#fdecea] disabled:opacity-60"
                  style={{ borderColor: `${COLORS.rose}40`, color: COLORS.rose }}
                >
                  <Trash2 size={13} />
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
                <button
                  type="button"
                  onClick={() => { setEditingHolding(null); setAddError(null) }}
                  className="flex-1 rounded-lg border px-4 py-2 text-[13px] font-semibold text-[#0d1117] transition-colors hover:bg-[#f0f8fa]"
                  style={{ borderColor: COLORS.border }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-lg px-4 py-2 text-[13px] font-semibold text-white shadow-[0_2px_8px_rgba(85,178,201,0.28)] disabled:opacity-60"
                  style={{ background: COLORS.primary }}
                >
                  {submitting ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
