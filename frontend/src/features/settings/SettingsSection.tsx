import { useEffect, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { COLORS } from '../../lib/utils'
import { useFinanceStore } from '../../store/useFinanceStore'
import type { ConnectedAccount } from '../../types'
import type { ProfileUpdateInput } from '../../lib/api'

const connectedAccounts: ConnectedAccount[] = [
  { n: 'Fidelity Brokerage', t: 'Public Investments', s: 'Connected', c: COLORS.mint },
  { n: 'Plaid – Chase Bank', t: 'Bank Deposits', s: 'Connected', c: COLORS.mint },
  { n: 'Coinbase', t: 'Digital Assets', s: 'Reconnect needed', c: COLORS.amber },
  { n: 'Carta (Equity)', t: 'Employer Equity', s: 'Connected', c: COLORS.mint },
]

const notificationPrefs: [string, boolean][] = [
  ['Wellness Score Drop (10+ pts)', true],
  ['Concentration Risk Alert', true],
  ['Low Liquidity Warning', true],
  ['Stale Valuations', false],
  ['Weekly Summary Email', true],
]

const GOAL_OPTIONS = [
  'Grow Wealth',
  'Save for Retirement',
  'Buy a Home',
  'Pay Off Debt',
  'Build Emergency Fund',
  'Fund Education',
  'Start a Business',
  'Financial Independence',
]

const inputCls =
  'w-full rounded-xl border border-[#cae7ee] bg-[#f0f8fa] px-3 py-2.5 text-[13px] text-[#0d1117] placeholder-[#7a9fad] outline-none focus:border-[#55b2c9] focus:ring-2 focus:ring-[rgba(85,178,201,0.15)] transition'
const labelCls = 'block mb-1 text-[11px] font-semibold uppercase tracking-wider text-[#7a9fad]'

export function SettingsSection() {
  const user = useFinanceStore((s) => s.user)
  const profile = useFinanceStore((s) => s.profile)
  const fetchProfile = useFinanceStore((s) => s.fetchProfile)
  const updateProfile = useFinanceStore((s) => s.updateProfile)

  useEffect(() => {
    fetchProfile()
  }, [])

  // Derived display values ― profile overrides Google user info
  const fullName = profile?.name ?? user?.name ?? 'Alex Johnson'
  const email = profile?.email ?? user?.email ?? 'alex.johnson@email.com'
  const picture = user?.picture
  const phone = profile?.phone ?? ''
  const bio = profile?.bio ?? ''
  const monthlyExpenses = profile?.monthlyExpenses ?? 6200
  const primaryGoal = profile?.primaryGoal ?? 'Grow Wealth'
  const initials = fullName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

  // Modal state
  const [showEdit, setShowEdit] = useState(false)
  const [form, setForm] = useState<ProfileUpdateInput>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const openEdit = () => {
    setForm({ name: fullName, email, phone, bio, monthlyExpenses, primaryGoal })
    setSaveError(null)
    setSaved(false)
    setShowEdit(true)
  }

  const closeEdit = () => { if (!saving) setShowEdit(false) }

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    try {
      await updateProfile(form)
      setSaved(true)
      setTimeout(() => setShowEdit(false), 700)
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  const profileFields: [string, string][] = [
    ['Full Name', fullName],
    ['Email', email],
    ['Phone', phone || '—'],
    ['Monthly Expenses', `$${monthlyExpenses.toLocaleString()}`],
    ['Primary Goal', primaryGoal],
    ['Bio', bio || '—'],
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* Profile card */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm font-semibold text-[#0d1117]">Profile</div>
          <button
            type="button"
            onClick={openEdit}
            className="rounded-lg border border-[#cae7ee] bg-[rgba(85,178,201,0.10)] px-3 py-1.5 text-[12px] font-semibold text-[#3d96ad] hover:bg-[rgba(85,178,201,0.18)] transition-colors"
          >
            Edit Profile
          </button>
        </div>

        <div className="mb-4 flex items-center gap-4">
          {picture ? (
            <img
              src={picture}
              alt={fullName}
              className="h-14 w-14 flex-shrink-0 rounded-full border-2 border-[#cae7ee] object-cover"
            />
          ) : (
            <div
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full text-xl font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.purple})` }}
            >
              {initials}
            </div>
          )}
          <div>
            <div className="text-[15px] font-semibold text-[#0d1117]">{fullName}</div>
            <div className="text-[12px] text-[#3a5260]">{email}</div>
            <div className="mt-0.5 text-[11px] text-[#1cb08a]">✓ Google Account · Premium Plan</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {profileFields.map(([label, value]) => (
            <div key={label} className="rounded-lg border border-[#cae7ee] bg-[#f0f8fa] px-3 py-2.5">
              <div className="mb-0.5 text-[10px] uppercase tracking-wider text-[#7a9fad]">{label}</div>
              <div className="text-[13px] font-medium text-[#0d1117]">{value}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Connected accounts */}
      <Card>
        <div className="mb-3 text-sm font-semibold text-[#0d1117]">Connected Accounts</div>
        <div className="flex flex-col gap-2">
          {connectedAccounts.map((a, i) => (
            <div key={i} className="flex items-center gap-2.5 rounded-xl border border-[#cae7ee] bg-[#f0f8fa] px-3.5 py-2.5">
              <div className="flex-1">
                <div className="text-[13px] font-medium text-[#0d1117]">{a.n}</div>
                <div className="mt-0.5 text-[11px] text-[#7a9fad]">{a.t}</div>
              </div>
              <span className="text-[11px] font-semibold" style={{ color: a.c }}>● {a.s}</span>
              <button type="button" className="rounded-lg border border-[#cae7ee] bg-[rgba(85,178,201,0.10)] px-2.5 py-1 text-[11px] font-medium text-[#3d96ad]">
                Manage
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Notification prefs */}
      <Card>
        <div className="mb-3 text-sm font-semibold text-[#0d1117]">Notification Preferences</div>
        <div className="flex flex-col">
          {notificationPrefs.map(([lbl, on], i, arr) => (
            <div
              key={i}
              className="flex items-center justify-between py-3"
              style={{ borderBottom: i < arr.length - 1 ? '1px solid #cae7ee' : 'none' }}
            >
              <span className="text-[13px] font-medium text-[#3a5260]">{lbl}</span>
              <div
                className="relative h-6 w-11 flex-shrink-0 cursor-pointer rounded-xl border transition-colors"
                style={{ background: on ? COLORS.primary : COLORS.light, borderColor: on ? COLORS.primaryDark : COLORS.borderStrong }}
              >
                <div className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm" style={{ left: on ? '23px' : '3px' }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Edit Profile Modal ──────────────────────────────────────────── */}
      {showEdit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(13,17,23,0.45)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) closeEdit() }}
        >
          <div className="w-full max-w-lg rounded-2xl border border-[#cae7ee] bg-white shadow-2xl">
            {/* Header */}
            <div
              className="flex items-center justify-between rounded-t-2xl px-5 py-4"
              style={{ background: `linear-gradient(135deg, ${COLORS.primary}22, ${COLORS.purple}18)` }}
            >
              <div>
                <div className="text-[15px] font-bold text-[#0d1117]">Edit Profile</div>
                <div className="text-[11px] text-[#3a5260]">Update your personal details</div>
              </div>
              <button
                onClick={closeEdit}
                className="rounded-lg p-1.5 text-[#7a9fad] hover:bg-[#cae7ee] hover:text-[#0d1117] transition-colors"
                disabled={saving}
              >✕</button>
            </div>

            {/* Form */}
            <div className="flex flex-col gap-3.5 px-5 py-4 max-h-[65vh] overflow-y-auto">
              <div>
                <label className={labelCls}>Full Name</label>
                <input
                  className={inputCls}
                  value={form.name ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className={labelCls}>Email</label>
                <input
                  className={inputCls + ' opacity-60 cursor-not-allowed'}
                  value={form.email ?? ''}
                  readOnly
                />
                <p className="mt-0.5 text-[10px] text-[#7a9fad]">Managed by your login provider</p>
              </div>

              <div>
                <label className={labelCls}>Phone</label>
                <input
                  className={inputCls}
                  type="tel"
                  value={form.phone ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Monthly Expenses ($)</label>
                  <input
                    className={inputCls}
                    type="number"
                    min={0}
                    value={form.monthlyExpenses ?? ''}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, monthlyExpenses: e.target.value === '' ? undefined : Number(e.target.value) }))
                    }
                    placeholder="6200"
                  />
                </div>
                <div>
                  <label className={labelCls}>Primary Goal</label>
                  <select
                    className={inputCls}
                    value={form.primaryGoal ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, primaryGoal: e.target.value }))}
                  >
                    {GOAL_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls}>Bio</label>
                <textarea
                  className={inputCls + ' resize-none'}
                  rows={3}
                  value={form.bio ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  placeholder="A short bio about yourself…"
                />
              </div>

              {saveError && (
                <div className="rounded-xl border border-[#fca5a5] bg-[#fff5f5] px-4 py-3 text-[12px] text-[#dc2626]">
                  {saveError}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2.5 border-t border-[#cae7ee] px-5 py-4">
              <button
                className="rounded-xl border border-[#cae7ee] px-4 py-2 text-[13px] font-medium text-[#3a5260] hover:bg-[#f0f8fa] transition-colors"
                onClick={closeEdit}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="rounded-xl px-5 py-2 text-[13px] font-semibold text-white transition-opacity disabled:opacity-60"
                style={{
                  background: saved
                    ? COLORS.mint
                    : `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.purple})`,
                }}
                onClick={handleSave}
                disabled={saving || saved}
              >
                {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
