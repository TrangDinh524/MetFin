import { Card } from '../../components/ui/Card'
import { COLORS } from '../../lib/utils'
import type { ConnectedAccount } from '../../types'

const profileFields: [string, string][] = [
  ['Full Name', 'Alex Johnson'],
  ['Email', 'alex.johnson@email.com'],
  ['Monthly Expenses', '$6,200'],
  ['Primary Goal', 'Grow Wealth'],
]

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

export function SettingsSection() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="mb-4 text-sm font-semibold text-[#0d1117]">Profile</div>
        <div className="mb-4 flex items-center gap-4">
          <div
            className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full text-xl font-bold text-white"
            style={{
              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.purple})`,
            }}
          >
            A
          </div>
          <div>
            <div className="text-[15px] font-semibold text-[#0d1117]">
              Alex Johnson
            </div>
            <div className="text-[12px] text-[#3a5260]">
              alex.johnson@email.com
            </div>
            <div className="mt-0.5 text-[11px] text-[#1cb08a]">
              ✓ MFA Enabled · Premium Plan
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {profileFields.map(([label, value]) => (
            <div
              key={label}
              className="rounded-lg border border-[#cae7ee] bg-[#f0f8fa] px-3 py-2.5"
            >
              <div className="mb-0.5 text-[10px] uppercase tracking-wider text-[#7a9fad]">
                {label}
              </div>
              <div className="text-[13px] font-medium text-[#0d1117]">
                {value}
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <div className="mb-3 text-sm font-semibold text-[#0d1117]">
          Connected Accounts
        </div>
        <div className="flex flex-col gap-2">
          {connectedAccounts.map((a, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 rounded-xl border border-[#cae7ee] bg-[#f0f8fa] px-3.5 py-2.5"
            >
              <div className="flex-1">
                <div className="text-[13px] font-medium text-[#0d1117]">
                  {a.n}
                </div>
                <div className="mt-0.5 text-[11px] text-[#7a9fad]">{a.t}</div>
              </div>
              <span className="text-[11px] font-semibold" style={{ color: a.c }}>
                ● {a.s}
              </span>
              <button
                type="button"
                className="rounded-lg border border-[#cae7ee] bg-[rgba(85,178,201,0.10)] px-2.5 py-1 text-[11px] font-medium text-[#3d96ad]"
              >
                Manage
              </button>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <div className="mb-3 text-sm font-semibold text-[#0d1117]">
          Notification Preferences
        </div>
        <div className="flex flex-col">
          {notificationPrefs.map(([lbl, on], i, arr) => (
            <div
              key={i}
              className="flex items-center justify-between py-3"
              style={{
                borderBottom:
                  i < arr.length - 1 ? '1px solid #cae7ee' : 'none',
              }}
            >
              <span className="text-[13px] font-medium text-[#3a5260]">
                {lbl}
              </span>
              <div
                className="relative h-6 w-11 flex-shrink-0 cursor-pointer rounded-xl border transition-colors"
                style={{
                  background: on ? COLORS.primary : COLORS.light,
                  borderColor: on ? COLORS.primaryDark : COLORS.borderStrong,
                }}
              >
                <div
                  className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-left"
                  style={{
                    left: on ? '23px' : '3px',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
