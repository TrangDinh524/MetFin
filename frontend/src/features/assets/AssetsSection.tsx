import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, ArrowUpRight, Activity, Plus, X, Pencil, Trash2, Coins, Wallet, Key, Link2, Landmark, ShieldCheck, Percent, Upload, FileText } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { StatCard } from '../../components/ui/StatCard'
import { AddButton } from '../../components/ui/AddButton'
import { fmt, fmtK, COLORS } from '../../lib/utils'
import type { SectorItem } from '../../types'
import type { HoldingCreateInput, BankAccount } from '../../lib/api'
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

  // Bank account edit/add state
  const [bankEditMode, setBankEditMode] = useState(false)
  const [showAddAccountModal, setShowAddAccountModal] = useState(false)
  const [addAccountTab, setAddAccountTab] = useState<'manual' | 'upload'>('manual')
  type BankFormState = { bankName: string; accountType: string; balance: string; apy: string; monthlyAvgBalance: string; maturityDate: string }
  const emptyBankForm = (): BankFormState => ({ bankName: '', accountType: 'Checking', balance: '', apy: '', monthlyAvgBalance: '', maturityDate: '' })
  const [bankForm, setBankForm] = useState<BankFormState>(emptyBankForm)
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null)
  const [bankConfirmDeleteId, setBankConfirmDeleteId] = useState<string | null>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadParsed, setUploadParsed] = useState<string | null>(null)

  // Coinbase API connection state
  const [showCoinbaseModal, setShowCoinbaseModal] = useState(false)
  const [coinbaseConnected, setCoinbaseConnected] = useState(() =>
    !!localStorage.getItem('metfin_coinbase_connected')
  )
  const [coinbaseNickname, setCoinbaseNickname] = useState(() =>
    localStorage.getItem('metfin_coinbase_nickname') ?? 'My Coinbase'
  )
  const [coinbaseForm, setCoinbaseForm] = useState({ nickname: 'My Coinbase', apiKey: '', apiSecret: '' })

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

  // Digital assets computed
  const cryptoHoldings = crypto?.holdings ?? []
  const cryptoGain = cryptoHoldings.reduce((s, h) => s + h.gain, 0)
  const cryptoCost = cryptoHoldings.reduce((s, h) => s + h.costBasis, 0)
  const cryptoGainPct = cryptoCost > 0 ? parseFloat(((cryptoGain / cryptoCost) * 100).toFixed(1)) : 0
  const assetMixColors: Record<string, string> = {
    Bitcoin: COLORS.amber,
    Ethereum: COLORS.purple,
    Stablecoins: COLORS.primary,
    Altcoins: COLORS.mint,
    NFTs: COLORS.rose,
  }
  const assetMix: SectorItem[] = crypto
    ? Object.entries(crypto.summary.assetMix).map(([n, v]) => ({
        n,
        v,
        c: assetMixColors[n] ?? COLORS.amber,
      }))
    : []

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
      ) : active === 'digital' ? (
        <>
          {/* ── Stat cards ── */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Portfolio Value"
              value={fmtK(crypto?.summary.totalValue ?? 0)}
              change={cryptoGainPct}
              note="all-time"
              color={COLORS.amber}
              Icon={Coins}
            />
            <StatCard
              label="All-Time Gain"
              value={`${cryptoGain >= 0 ? '+' : ''}${fmt(cryptoGain)}`}
              change={cryptoGainPct}
              note="total"
              color={COLORS.mint}
              Icon={TrendingUp}
            />
            <StatCard
              label="Wallets Tracked"
              value={(crypto?.summary.walletsTracked ?? 0).toString()}
              change={cryptoGainPct}
              note={`${crypto?.summary.liquidity ?? '—'} liquidity`}
              color={COLORS.purple}
              Icon={Wallet}
            />
          </div>

          {/* ── Holdings + asset mix ── */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_252px]">
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-[#0d1117]">Coinbase Digital Assets</div>
                    {coinbaseConnected && (
                      <span
                        className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold"
                        style={{ borderColor: `${COLORS.mint}40`, background: `${COLORS.mint}10`, color: COLORS.mint }}
                      >
                        <div className="h-1.5 w-1.5 rounded-full" style={{ background: COLORS.mint }} />
                        {coinbaseNickname}
                      </span>
                    )}
                  </div>
                  {!coinbaseConnected && (
                    <div className="mt-0.5 text-[11px]" style={{ color: COLORS.textMuted }}>
                      Connect your API to sync live balances
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCoinbaseForm({ nickname: coinbaseNickname, apiKey: '', apiSecret: '' })
                    setShowCoinbaseModal(true)
                  }}
                  className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-semibold transition-colors"
                  style={{
                    borderColor: coinbaseConnected ? COLORS.border : COLORS.amber,
                    color: coinbaseConnected ? COLORS.textDim : COLORS.amber,
                    background: coinbaseConnected ? 'transparent' : `${COLORS.amber}10`,
                  }}
                >
                  {coinbaseConnected ? <Link2 size={12} /> : <Key size={12} />}
                  {coinbaseConnected ? 'Manage' : 'Connect Coinbase API'}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[#cae7ee]">
                      {['Asset', 'Symbol', 'Quantity', 'Value', 'Gain / Loss', 'Network'].map((h) => (
                        <th
                          key={h}
                          className="px-2.5 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wider text-[#7a9fad]"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cryptoHoldings.map((h) => (
                      <tr
                        key={h.id}
                        className="border-b border-[#cae7ee]/30 transition-colors hover:bg-[#f0f8fa]"
                      >
                        <td className="px-2.5 py-2.5 text-[13px] font-medium text-[#0d1117]">{h.name}</td>
                        <td className="px-2.5 py-2.5">
                          <span
                            className="rounded-md border px-2 py-0.5 text-[11px] font-bold"
                            style={{ borderColor: '#cae7ee', background: `${COLORS.amber}12`, color: COLORS.amber }}
                          >
                            {h.symbol}
                          </span>
                        </td>
                        <td className="px-2.5 py-2.5 text-[12px] text-[#3a5260]">
                          {h.quantity.toLocaleString('en-US', { maximumFractionDigits: 6 })}
                        </td>
                        <td className="px-2.5 py-2.5 text-[13px] font-semibold text-[#0d1117]">
                          {fmt(h.value)}
                        </td>
                        <td className="px-2.5 py-2.5">
                          <span
                            className={`text-[12px] font-bold ${
                              h.gainPct >= 0 ? 'text-[#1cb08a]' : 'text-[#d44a4a]'
                            }`}
                          >
                            {h.gainPct >= 0 ? '+' : ''}{h.gainPct}%
                          </span>
                        </td>
                        <td className="px-2.5 py-2.5">
                          <span className="rounded-md bg-[#cae7ee] px-2 py-0.5 text-[11px] text-[#3a5260]">
                            {h.chain}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Right panel: Asset Mix + connect-prompt */}
            <div className="flex flex-col gap-3">
              <Card className="flex flex-col gap-3">
                <div className="text-sm font-semibold text-[#0d1117]">Asset Mix</div>
                <PieChart width={196} height={148}>
                  <Pie
                    data={assetMix}
                    cx={98}
                    cy={68}
                    innerRadius={38}
                    outerRadius={62}
                    dataKey="v"
                    paddingAngle={3}
                  >
                    {assetMix.map((s, i) => (
                      <Cell key={i} fill={s.c} />
                    ))}
                  </Pie>
                </PieChart>
                <div className="flex flex-col gap-2">
                  {assetMix.map((s, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-sm" style={{ background: s.c }} />
                        <span className="text-[11px] text-[#3a5260]">{s.n}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-[#0d1117]">{s.v}%</span>
                    </div>
                  ))}
                </div>
              </Card>

              {!coinbaseConnected && (
                <Card className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                      style={{ background: `${COLORS.amber}18` }}
                    >
                      <Key size={14} style={{ color: COLORS.amber }} />
                    </div>
                    <div>
                      <div className="text-[12px] font-semibold text-[#0d1117]">Sync Live Prices</div>
                      <div className="text-[10px]" style={{ color: COLORS.textMuted }}>Coinbase Advanced Trade API</div>
                    </div>
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: COLORS.textDim }}>
                    Link a read-only key to pull real‑time balances and prices automatically.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCoinbaseForm({ nickname: 'My Coinbase', apiKey: '', apiSecret: '' })
                      setShowCoinbaseModal(true)
                    }}
                    className="w-full rounded-lg py-2 text-[12px] font-semibold text-white"
                    style={{ background: COLORS.amber, boxShadow: '0 2px 8px rgba(212,134,10,0.25)' }}
                  >
                    Connect Now
                  </button>
                </Card>
              )}
            </div>
          </div>
        </>
      ) : active === 'bank' ? (
        <>
          {/* ── Bank Deposits stat cards ── */}
          {(() => {
            const accounts = banking?.accounts ?? []
            const totalBalance = banking?.summary.totalBalance ?? 0
            const fdicCovered = banking?.summary.fdicCovered ?? 0
            const fdicCoveredPct = banking?.summary.fdicCoveredPct ?? 100
            const apyValues = accounts.map((a) => a.apy).filter((v) => v > 0)
            const highestApy = apyValues.length > 0 ? Math.max(...apyValues) : 0
            const accountTypeMix: SectorItem[] = banking
              ? Object.entries(banking.summary.accountTypeMix).map(([n, v], i) => ({
                  n,
                  v,
                  c: [COLORS.primary, COLORS.mint, COLORS.purple, COLORS.amber][i % 4],
                }))
              : []

            const typeColors: Record<string, string> = {
              Checking: COLORS.primary,
              Savings: COLORS.mint,
              CD: COLORS.purple,
              MoneyMarket: COLORS.amber,
            }

            return (
              <>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <StatCard
                    label="Total Deposits"
                    value={fmtK(totalBalance)}
                    change={0}
                    note="across all accounts"
                    color={COLORS.primary}
                    Icon={Landmark}
                  />
                  <StatCard
                    label="FDIC Coverage"
                    value={fmtK(fdicCovered)}
                    change={fdicCoveredPct}
                    note={`${fdicCoveredPct}% insured`}
                    color={COLORS.mint}
                    Icon={ShieldCheck}
                  />
                  <StatCard
                    label="Best APY"
                    value={`${highestApy}%`}
                    change={highestApy}
                    note="highest rate"
                    color={COLORS.purple}
                    Icon={Percent}
                  />
                </div>

                {/* ── Accounts table + type mix ── */}
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_252px]">
                  <Card>
                    <div className="mb-4 flex items-center justify-between">
                      <div className="text-sm font-semibold text-[#0d1117]">Accounts</div>
                      <div className="flex items-center gap-2">
                        {accounts.length > 0 && (
                          <button
                            type="button"
                            onClick={() => { setBankEditMode((v) => !v); setBankConfirmDeleteId(null) }}
                            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-semibold transition-colors"
                            style={{
                              borderColor: bankEditMode ? COLORS.primary : COLORS.border,
                              color: bankEditMode ? COLORS.primary : COLORS.textDim,
                              background: bankEditMode ? `${COLORS.primary}10` : 'transparent',
                            }}
                          >
                            <Pencil size={12} />
                            Edit Accounts
                          </button>
                        )}
                        <AddButton
                          label="Add Account"
                          color={COLORS.primary}
                          onClick={() => { setBankForm(emptyBankForm()); setUploadFile(null); setUploadError(null); setUploadParsed(null); setAddAccountTab('manual'); setShowAddAccountModal(true) }}
                        />
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-[#cae7ee]">
                            {['Institution', 'Type', 'Balance', 'APY', 'Avg Monthly', 'FDIC Insured', 'Matures', ...(bankEditMode ? [''] : [])].map((h) => (
                              <th
                                key={h}
                                className="px-2.5 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wider text-[#7a9fad]"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {accounts.map((a) => {
                            const isConfirming = bankConfirmDeleteId === a.id
                            return (
                              <tr
                                key={a.id}
                                className="border-b border-[#cae7ee]/30 transition-colors hover:bg-[#f0f8fa]"
                                style={isConfirming ? { background: `${COLORS.rose}06` } : {}}
                              >
                                <td className="px-2.5 py-2.5 text-[13px] font-medium text-[#0d1117]">
                                  {a.bankName}
                                </td>
                                <td className="px-2.5 py-2.5">
                                  <span
                                    className="rounded-md border px-2 py-0.5 text-[11px] font-semibold"
                                    style={{
                                      borderColor: `${typeColors[a.accountType] ?? COLORS.primary}40`,
                                      background: `${typeColors[a.accountType] ?? COLORS.primary}12`,
                                      color: typeColors[a.accountType] ?? COLORS.primary,
                                    }}
                                  >
                                    {a.accountType}
                                  </span>
                                </td>
                                <td className="px-2.5 py-2.5 text-[13px] font-semibold text-[#0d1117]">
                                  {fmt(a.balance)}
                                </td>
                                <td className="px-2.5 py-2.5">
                                  <span
                                    className="text-[12px] font-bold"
                                    style={{ color: a.apy >= 4 ? COLORS.mint : a.apy > 0.5 ? COLORS.primary : COLORS.textDim }}
                                  >
                                    {a.apy}%
                                  </span>
                                </td>
                                <td className="px-2.5 py-2.5 text-[12px] text-[#3a5260]">
                                  {fmt(a.monthlyAvgBalance)}
                                </td>
                                <td className="px-2.5 py-2.5">
                                  {a.fdicInsured === a.balance ? (
                                    <span
                                      className="flex items-center gap-1 text-[11px] font-semibold"
                                      style={{ color: COLORS.mint }}
                                    >
                                      <ShieldCheck size={11} />
                                      {fmt(a.fdicInsured)}
                                    </span>
                                  ) : (
                                    <span className="text-[11px] text-[#3a5260]">{fmt(a.fdicInsured)}</span>
                                  )}
                                </td>
                                <td className="px-2.5 py-2.5 text-[11px] text-[#7a9fad]">
                                  {a.maturityDate ?? '—'}
                                </td>
                                {bankEditMode && (
                                  <td className="px-2.5 py-2.5">
                                    {isConfirming ? (
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[11px] text-[#7a9fad]">Delete?</span>
                                        <button
                                          type="button"
                                          onClick={() => setBankConfirmDeleteId(null)}
                                          className="rounded-lg px-2 py-0.5 text-[11px] font-semibold"
                                          style={{ color: COLORS.rose, border: `1px solid ${COLORS.rose}40` }}
                                        >
                                          Yes
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setBankConfirmDeleteId(null)}
                                          className="rounded-lg border px-2 py-0.5 text-[11px] font-semibold"
                                          style={{ borderColor: COLORS.border, color: COLORS.textDim }}
                                        >
                                          No
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingAccount(a)
                                            setBankForm({
                                              bankName: a.bankName,
                                              accountType: a.accountType,
                                              balance: String(a.balance),
                                              apy: String(a.apy),
                                              monthlyAvgBalance: String(a.monthlyAvgBalance),
                                              maturityDate: a.maturityDate ?? '',
                                            })
                                          }}
                                          className="rounded-lg p-1.5 transition-colors hover:bg-[#cae7ee]/50"
                                          style={{ color: COLORS.primary }}
                                          title="Edit"
                                        >
                                          <Pencil size={12} />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setBankConfirmDeleteId(a.id)}
                                          className="rounded-lg p-1.5 transition-colors hover:bg-[#fdecea]"
                                          style={{ color: COLORS.rose }}
                                          title="Delete"
                                        >
                                          <Trash2 size={12} />
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

                  {/* Right panel */}
                  <div className="flex flex-col gap-3">
                    <Card className="flex flex-col gap-3">
                      <div className="text-sm font-semibold text-[#0d1117]">Account Mix</div>
                      <PieChart width={196} height={148}>
                        <Pie
                          data={accountTypeMix}
                          cx={98}
                          cy={68}
                          innerRadius={38}
                          outerRadius={62}
                          dataKey="v"
                          paddingAngle={3}
                        >
                          {accountTypeMix.map((s, i) => (
                            <Cell key={i} fill={s.c} />
                          ))}
                        </Pie>
                      </PieChart>
                      <div className="flex flex-col gap-2">
                        {accountTypeMix.map((s, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <div className="h-2 w-2 rounded-sm" style={{ background: s.c }} />
                              <span className="text-[11px] text-[#3a5260]">{s.n}</span>
                            </div>
                            <span className="text-[11px] font-semibold text-[#0d1117]">{s.v}%</span>
                          </div>
                        ))}
                      </div>
                    </Card>

                    {/* FDIC summary card */}
                    <Card className="flex flex-col gap-2.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                          style={{ background: `${COLORS.mint}18` }}
                        >
                          <ShieldCheck size={14} style={{ color: COLORS.mint }} />
                        </div>
                        <div>
                          <div className="text-[12px] font-semibold text-[#0d1117]">FDIC Protection</div>
                          <div className="text-[10px]" style={{ color: COLORS.textMuted }}>
                            Up to $250k per bank
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: `${COLORS.mint}10` }}>
                        <span className="text-[11px] text-[#3a5260]">Covered</span>
                        <span className="text-[12px] font-bold" style={{ color: COLORS.mint }}>
                          {fdicCoveredPct}%
                        </span>
                      </div>
                      {(banking?.summary.fdicExposed ?? 0) > 0 && (
                        <div className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: `${COLORS.rose}10` }}>
                          <span className="text-[11px] text-[#3a5260]">Uninsured</span>
                          <span className="text-[12px] font-bold" style={{ color: COLORS.rose }}>
                            {fmt(banking!.summary.fdicExposed)}
                          </span>
                        </div>
                      )}
                    </Card>
                  </div>
                </div>
              </>
            )
          })()}
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

      {/* ── Coinbase API Modal ── */}
      {showCoinbaseModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(13,17,23,0.45)' }}
          onClick={() => setShowCoinbaseModal(false)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl"
            style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowCoinbaseModal(false)}
              className="absolute right-4 top-4 rounded-full p-1 transition-colors hover:bg-[#cae7ee]/40"
            >
              <X size={16} style={{ color: COLORS.textDim }} />
            </button>

            {/* Header */}
            <div className="mb-5">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: `${COLORS.amber}18` }}
                >
                  <Key size={16} style={{ color: COLORS.amber }} />
                </div>
                <div>
                  <div className="text-base font-semibold text-[#0d1117]">
                    {coinbaseConnected ? 'Manage Coinbase API' : 'Connect Coinbase API'}
                  </div>
                  <div className="text-[11px]" style={{ color: COLORS.textMuted }}>
                    Coinbase Advanced Trade · Read-only
                  </div>
                </div>
              </div>

              {/* Step-by-step guide */}
              <div
                className="mt-4 flex flex-col gap-2 rounded-xl p-3"
                style={{ background: `${COLORS.amber}08`, border: `1px solid ${COLORS.amber}30` }}
              >
                <div
                  className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: COLORS.amber }}
                >
                  How to get your API key
                </div>
                {[
                  'Go to coinbase.com → Settings → API',
                  'Click "New API Key" → select Advanced Trade',
                  'Enable View permissions only (no trading)',
                  'Copy the Key Name and Private Key below',
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span
                      className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
                      style={{ background: COLORS.amber }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-[11px]" style={{ color: COLORS.textDim }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Form fields */}
            <div className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-[#7a9fad]">Nickname</label>
                <input
                  className="rounded-lg border px-3 py-2 text-[13px] outline-none"
                  style={{ borderColor: COLORS.border, background: '#f7fcfd', color: '#0d1117' }}
                  placeholder="e.g. My Coinbase"
                  value={coinbaseForm.nickname}
                  onChange={(e) => setCoinbaseForm({ ...coinbaseForm, nickname: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-[#7a9fad]">Key Name (API Key)</label>
                <input
                  className="rounded-lg border px-3 py-2 font-mono text-[12px] outline-none"
                  style={{ borderColor: COLORS.border, background: '#f7fcfd', color: COLORS.primaryDark }}
                  placeholder="organizations/abc123…/apiKeys/def456…"
                  value={coinbaseForm.apiKey}
                  onChange={(e) => setCoinbaseForm({ ...coinbaseForm, apiKey: e.target.value })}
                />
                <span className="text-[10px]" style={{ color: COLORS.textMuted }}>
                  Format: organizations/&#123;org-id&#125;/apiKeys/&#123;key-id&#125;
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold uppercase tracking-wide text-[#7a9fad]">Private Key (API Secret)</label>
                <textarea
                  className="rounded-lg border px-3 py-2 font-mono text-[11px] outline-none"
                  style={{ borderColor: COLORS.border, background: '#f7fcfd', color: '#0d1117', resize: 'none' }}
                  rows={3}
                  placeholder={`-----BEGIN EC PRIVATE KEY-----\nMHQCAQEEI…\n-----END EC PRIVATE KEY-----`}
                  value={coinbaseForm.apiSecret}
                  onChange={(e) => setCoinbaseForm({ ...coinbaseForm, apiSecret: e.target.value })}
                />
                <span className="text-[10px]" style={{ color: COLORS.textMuted }}>
                  Stored locally only — never sent to MetFin servers.
                </span>
              </div>

              <div
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-[11px]"
                style={{ background: `${COLORS.primary}10`, border: `1px solid ${COLORS.primary}25` }}
              >
                <Link2 size={11} style={{ color: COLORS.primary, flexShrink: 0 }} />
                <span style={{ color: COLORS.textDim }}>
                  Only read-only permissions are required. MetFin cannot trade or move your funds.
                </span>
              </div>

              <div className="mt-1 flex gap-2">
                {coinbaseConnected && (
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem('metfin_coinbase_connected')
                      localStorage.removeItem('metfin_coinbase_nickname')
                      setCoinbaseConnected(false)
                      setCoinbaseNickname('My Coinbase')
                      setShowCoinbaseModal(false)
                    }}
                    className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] font-semibold transition-colors hover:bg-[#fdecea]"
                    style={{ borderColor: `${COLORS.rose}40`, color: COLORS.rose }}
                  >
                    Disconnect
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowCoinbaseModal(false)}
                  className="flex-1 rounded-lg border px-4 py-2 text-[13px] font-semibold text-[#0d1117] transition-colors hover:bg-[#f0f8fa]"
                  style={{ borderColor: COLORS.border }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const nick = coinbaseForm.nickname.trim() || 'My Coinbase'
                    localStorage.setItem('metfin_coinbase_connected', '1')
                    localStorage.setItem('metfin_coinbase_nickname', nick)
                    setCoinbaseConnected(true)
                    setCoinbaseNickname(nick)
                    setShowCoinbaseModal(false)
                  }}
                  className="flex-1 rounded-lg px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-60"
                  style={{ background: COLORS.amber, boxShadow: '0 2px 8px rgba(212,134,10,0.28)' }}
                >
                  {coinbaseConnected ? 'Save Changes' : 'Connect Wallet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Account Modal ── */}
      {showAddAccountModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(13,17,23,0.45)' }}
          onClick={() => setShowAddAccountModal(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl p-6 shadow-2xl"
            style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowAddAccountModal(false)}
              className="absolute right-4 top-4 rounded-full p-1 transition-colors hover:bg-[#cae7ee]/40"
            >
              <X size={16} style={{ color: COLORS.textDim }} />
            </button>

            <div className="mb-4">
              <div className="text-base font-semibold text-[#0d1117]">Add Account</div>
              <div className="mt-0.5 text-[11px] text-[#7a9fad]">Add a bank deposit account manually or import from a document</div>
            </div>

            {/* Tab switcher */}
            <div className="mb-5 flex gap-1 rounded-xl p-1" style={{ background: '#f0f8fa' }}>
              {(['manual', 'upload'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setAddAccountTab(tab)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-[12px] font-semibold transition-all"
                  style={{
                    background: addAccountTab === tab ? '#fff' : 'transparent',
                    color: addAccountTab === tab ? COLORS.primary : COLORS.textDim,
                    boxShadow: addAccountTab === tab ? '0 1px 4px rgba(85,178,201,0.15)' : 'none',
                  }}
                >
                  {tab === 'manual' ? <Pencil size={12} /> : <Upload size={12} />}
                  {tab === 'manual' ? 'Manual Entry' : 'Upload Document'}
                </button>
              ))}
            </div>

            {addAccountTab === 'manual' ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  // In a real app this would POST to the backend; for now just close
                  setShowAddAccountModal(false)
                }}
                className="flex flex-col gap-3.5"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 flex flex-col gap-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-[#7a9fad]">Institution Name</label>
                    <input
                      required
                      className="rounded-lg border px-3 py-2 text-[13px] outline-none"
                      style={{ borderColor: COLORS.border, background: '#f7fcfd', color: '#0d1117' }}
                      placeholder="e.g. Chase Bank"
                      value={bankForm.bankName}
                      onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-[#7a9fad]">Account Type</label>
                    <select
                      className="rounded-lg border px-3 py-2 text-[13px] outline-none"
                      style={{ borderColor: COLORS.border, background: '#f7fcfd', color: '#0d1117' }}
                      value={bankForm.accountType}
                      onChange={(e) => setBankForm({ ...bankForm, accountType: e.target.value })}
                    >
                      {['Checking', 'Savings', 'CD', 'MoneyMarket'].map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-[#7a9fad]">Balance ($)</label>
                    <input
                      required
                      type="number"
                      min={0}
                      step="any"
                      className="rounded-lg border px-3 py-2 text-[13px] outline-none"
                      style={{ borderColor: COLORS.border, background: '#f7fcfd', color: '#0d1117' }}
                      placeholder="0.00"
                      value={bankForm.balance}
                      onChange={(e) => setBankForm({ ...bankForm, balance: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-[#7a9fad]">APY (%)</label>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      className="rounded-lg border px-3 py-2 text-[13px] outline-none"
                      style={{ borderColor: COLORS.border, background: '#f7fcfd', color: '#0d1117' }}
                      placeholder="e.g. 4.25"
                      value={bankForm.apy}
                      onChange={(e) => setBankForm({ ...bankForm, apy: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-[#7a9fad]">Avg Monthly Balance ($)</label>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      className="rounded-lg border px-3 py-2 text-[13px] outline-none"
                      style={{ borderColor: COLORS.border, background: '#f7fcfd', color: '#0d1117' }}
                      placeholder="0.00"
                      value={bankForm.monthlyAvgBalance}
                      onChange={(e) => setBankForm({ ...bankForm, monthlyAvgBalance: e.target.value })}
                    />
                  </div>
                  {(bankForm.accountType === 'CD') && (
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold uppercase tracking-wide text-[#7a9fad]">Maturity Date</label>
                      <input
                        type="date"
                        className="rounded-lg border px-3 py-2 text-[13px] outline-none"
                        style={{ borderColor: COLORS.border, background: '#f7fcfd', color: '#0d1117' }}
                        value={bankForm.maturityDate}
                        onChange={(e) => setBankForm({ ...bankForm, maturityDate: e.target.value })}
                      />
                    </div>
                  )}
                </div>
                <div className="mt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddAccountModal(false)}
                    className="flex-1 rounded-lg border px-4 py-2 text-[13px] font-semibold text-[#0d1117] transition-colors hover:bg-[#f0f8fa]"
                    style={{ borderColor: COLORS.border }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-lg px-4 py-2 text-[13px] font-semibold text-white shadow-[0_2px_8px_rgba(85,178,201,0.28)]"
                    style={{ background: COLORS.primary }}
                  >
                    Add Account
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col gap-4">
                <div
                  className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 transition-colors"
                  style={{ borderColor: uploadFile ? COLORS.mint : COLORS.border, background: uploadFile ? `${COLORS.mint}08` : '#f7fcfd' }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    const file = e.dataTransfer.files[0]
                    if (file) {
                      if (!['application/pdf', 'text/csv', 'image/png', 'image/jpeg'].includes(file.type)) {
                        setUploadError('Unsupported file type. Please upload a PDF, CSV, PNG, or JPG.')
                      } else {
                        setUploadError(null)
                        setUploadFile(file)
                        setUploadParsed(`Detected: ${file.name} (${(file.size / 1024).toFixed(1)} KB) — ready to parse`)
                      }
                    }
                  }}
                >
                  {uploadFile ? (
                    <>
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-full"
                        style={{ background: `${COLORS.mint}18` }}
                      >
                        <FileText size={22} style={{ color: COLORS.mint }} />
                      </div>
                      <div className="text-center">
                        <div className="text-[13px] font-semibold text-[#0d1117]">{uploadFile.name}</div>
                        <div className="text-[11px]" style={{ color: COLORS.textMuted }}>
                          {(uploadFile.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setUploadFile(null); setUploadParsed(null); setUploadError(null) }}
                        className="text-[11px] font-semibold underline"
                        style={{ color: COLORS.rose }}
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <>
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-full"
                        style={{ background: `${COLORS.primary}12` }}
                      >
                        <Upload size={22} style={{ color: COLORS.primary }} />
                      </div>
                      <div className="text-center">
                        <div className="text-[13px] font-semibold text-[#0d1117]">Drop your statement here</div>
                        <div className="mt-0.5 text-[11px]" style={{ color: COLORS.textMuted }}>
                          PDF, CSV, PNG, or JPG · up to 10 MB
                        </div>
                      </div>
                      <label
                        className="cursor-pointer rounded-lg border px-4 py-1.5 text-[12px] font-semibold transition-colors hover:bg-[#f0f8fa]"
                        style={{ borderColor: COLORS.border, color: COLORS.primary }}
                      >
                        Browse files
                        <input
                          type="file"
                          accept=".pdf,.csv,.png,.jpg,.jpeg"
                          className="sr-only"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setUploadError(null)
                              setUploadFile(file)
                              setUploadParsed(`Detected: ${file.name} (${(file.size / 1024).toFixed(1)} KB) — ready to parse`)
                            }
                          }}
                        />
                      </label>
                    </>
                  )}
                </div>

                {uploadError && (
                  <div className="rounded-lg px-3 py-2 text-[12px]" style={{ background: '#fdecea', color: '#b91c1c', border: '1px solid #fca5a5' }}>
                    {uploadError}
                  </div>
                )}
                {uploadParsed && !uploadError && (
                  <div className="rounded-lg px-3 py-2 text-[12px]" style={{ background: `${COLORS.mint}10`, color: COLORS.mint, border: `1px solid ${COLORS.mint}30` }}>
                    {uploadParsed}
                  </div>
                )}

                <div className="text-[11px]" style={{ color: COLORS.textMuted }}>
                  Supported: bank statements (PDF), exported transactions (CSV), or screenshots (PNG/JPG). MetFin will auto-extract institution, account type, and balance.
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddAccountModal(false)}
                    className="flex-1 rounded-lg border px-4 py-2 text-[13px] font-semibold text-[#0d1117] transition-colors hover:bg-[#f0f8fa]"
                    style={{ borderColor: COLORS.border }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!uploadFile}
                    className="flex-1 rounded-lg px-4 py-2 text-[13px] font-semibold text-white shadow-[0_2px_8px_rgba(85,178,201,0.28)] disabled:opacity-40"
                    style={{ background: COLORS.primary }}
                    onClick={() => setShowAddAccountModal(false)}
                  >
                    Import Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Edit Account Modal ── */}
      {editingAccount && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(13,17,23,0.45)' }}
          onClick={() => setEditingAccount(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl p-6 shadow-2xl"
            style={{ background: COLORS.card, border: `1px solid ${COLORS.border}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setEditingAccount(null)}
              className="absolute right-4 top-4 rounded-full p-1 transition-colors hover:bg-[#cae7ee]/40"
            >
              <X size={16} style={{ color: COLORS.textDim }} />
            </button>
            <div className="mb-5">
              <div className="text-base font-semibold text-[#0d1117]">Edit Account</div>
              <div className="mt-0.5 text-[11px] text-[#7a9fad]">{editingAccount.bankName}</div>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                // In a real app this would PATCH to the backend; for now just close
                setEditingAccount(null)
              }}
              className="flex flex-col gap-3.5"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 flex flex-col gap-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-[#7a9fad]">Institution Name</label>
                  <input
                    required
                    className="rounded-lg border px-3 py-2 text-[13px] outline-none"
                    style={{ borderColor: COLORS.border, background: '#f7fcfd', color: '#0d1117' }}
                    value={bankForm.bankName}
                    onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-[#7a9fad]">Account Type</label>
                  <select
                    className="rounded-lg border px-3 py-2 text-[13px] outline-none"
                    style={{ borderColor: COLORS.border, background: '#f7fcfd', color: '#0d1117' }}
                    value={bankForm.accountType}
                    onChange={(e) => setBankForm({ ...bankForm, accountType: e.target.value })}
                  >
                    {['Checking', 'Savings', 'CD', 'MoneyMarket'].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-[#7a9fad]">Balance ($)</label>
                  <input
                    required
                    type="number"
                    min={0}
                    step="any"
                    className="rounded-lg border px-3 py-2 text-[13px] outline-none"
                    style={{ borderColor: COLORS.border, background: '#f7fcfd', color: '#0d1117' }}
                    value={bankForm.balance}
                    onChange={(e) => setBankForm({ ...bankForm, balance: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-[#7a9fad]">APY (%)</label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    className="rounded-lg border px-3 py-2 text-[13px] outline-none"
                    style={{ borderColor: COLORS.border, background: '#f7fcfd', color: '#0d1117' }}
                    value={bankForm.apy}
                    onChange={(e) => setBankForm({ ...bankForm, apy: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-[#7a9fad]">Avg Monthly Balance ($)</label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    className="rounded-lg border px-3 py-2 text-[13px] outline-none"
                    style={{ borderColor: COLORS.border, background: '#f7fcfd', color: '#0d1117' }}
                    value={bankForm.monthlyAvgBalance}
                    onChange={(e) => setBankForm({ ...bankForm, monthlyAvgBalance: e.target.value })}
                  />
                </div>
                {bankForm.accountType === 'CD' && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wide text-[#7a9fad]">Maturity Date</label>
                    <input
                      type="date"
                      className="rounded-lg border px-3 py-2 text-[13px] outline-none"
                      style={{ borderColor: COLORS.border, background: '#f7fcfd', color: '#0d1117' }}
                      value={bankForm.maturityDate}
                      onChange={(e) => setBankForm({ ...bankForm, maturityDate: e.target.value })}
                    />
                  </div>
                )}
              </div>
              <div className="mt-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => { setBankConfirmDeleteId(editingAccount.id); setEditingAccount(null) }}
                  className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] font-semibold transition-colors hover:bg-[#fdecea]"
                  style={{ borderColor: `${COLORS.rose}40`, color: COLORS.rose }}
                >
                  <Trash2 size={13} />
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="flex-1 rounded-lg border px-4 py-2 text-[13px] font-semibold text-[#0d1117] transition-colors hover:bg-[#f0f8fa]"
                  style={{ borderColor: COLORS.border }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg px-4 py-2 text-[13px] font-semibold text-white shadow-[0_2px_8px_rgba(85,178,201,0.28)]"
                  style={{ background: COLORS.primary }}
                >
                  Save Changes
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
