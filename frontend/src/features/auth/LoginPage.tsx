import {
  DollarSign,
  TrendingUp,
  Zap,
  BarChart2,
  ShieldCheck,
  Activity,
} from 'lucide-react'
import { GoogleLogin } from '@react-oauth/google'
import { useFinanceStore } from '../../store/useFinanceStore'

const features = [
  {
    Icon: DollarSign,
    color: '#55b2c9',
    bg: 'rgba(85,178,201,0.10)',
    title: 'Unified Net Worth',
    desc: 'See every asset and liability in one place — investments, bank accounts, crypto, and debt — updated in real time.',
  },
  {
    Icon: TrendingUp,
    color: '#1cb08a',
    bg: 'rgba(28,176,138,0.10)',
    title: 'Portfolio Intelligence',
    desc: 'Track public equities, private assets, and employer equity with sector, geography, and allocation breakdowns.',
  },
  {
    Icon: Zap,
    color: '#7155c9',
    bg: 'rgba(113,85,201,0.10)',
    title: 'AI-Powered Insights',
    desc: 'Actionable alerts ranked by severity — concentration risk, low liquidity, stale valuations, and more.',
  },
  {
    Icon: BarChart2,
    color: '#d4860a',
    bg: 'rgba(212,134,10,0.10)',
    title: 'Scenario Lab',
    desc: 'Model life events — paying off debt early, investing a bonus, or a market downturn — and see the projected impact.',
  },
  {
    Icon: Activity,
    color: '#d44a4a',
    bg: 'rgba(212,74,74,0.10)',
    title: 'Financial Wellness Score',
    desc: 'A composite 0–100 score across liquidity, diversification, debt load, and savings rate — with sub-score breakdowns.',
  },
  {
    Icon: ShieldCheck,
    color: '#55b2c9',
    bg: 'rgba(85,178,201,0.10)',
    title: 'Bank-Grade Security',
    desc: 'Sign in with your Google account. Your data never leaves your session — nothing is stored on our servers.',
  },
]

const stats = [
  { value: '$2.4M+', label: 'Average net worth tracked' },
  { value: '6', label: 'Asset classes supported' },
  { value: '< 1s', label: 'Dashboard load time' },
  { value: '100%', label: 'Private by design' },
]

export function LoginPage() {
  const loginWithGoogle = useFinanceStore((s) => s.loginWithGoogle)
  const loginAsGuest = useFinanceStore((s) => s.loginAsGuest)
  const authLoading = useFinanceStore((s) => s.authLoading)

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[#cae7ee] bg-white/90 px-6 backdrop-blur-sm sm:px-10">
        <span className="text-[20px] font-extrabold tracking-tight text-[#1a3a4a]">
          Met<span className="text-[#55b2c9]">Fin</span>
        </span>
        <div className="flex items-center gap-2 scale-90 origin-right">
          {authLoading ? (
            <span className="text-[12px] text-[#7a9fad]">Signing in…</span>
          ) : (
            <>
              <GoogleLogin
                onSuccess={({ credential }) => { if (credential) loginWithGoogle(credential) }}
                onError={() => console.error('Google login failed')}
                shape="pill"
                theme="outline"
                size="medium"
                text="signin_with"
              />
              <button
                onClick={loginAsGuest}
                className="rounded-full border border-[#cae7ee] bg-white px-3.5 py-1.5 text-[12px] font-semibold text-[#3d96ad] transition hover:bg-[#f0f8fa] hover:border-[#3d96ad]"
              >
                Guest
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#e8f5f8] via-white to-[#f0f0fc] px-6 py-20 text-center sm:px-10 sm:py-28">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[#55b2c9] opacity-[0.07] blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-[#7155c9] opacity-[0.06] blur-3xl" />

        <div className="relative mx-auto max-w-2xl">
          <span className="mb-4 inline-block rounded-full border border-[#cae7ee] bg-[#f0f8fa] px-3.5 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#3d96ad]">
            Personal Finance Intelligence
          </span>
          <h1 className="mb-5 text-4xl font-extrabold leading-tight tracking-tight text-[#0d1117] sm:text-5xl">
            Your complete financial<br />
            <span className="text-[#55b2c9]">picture, at a glance.</span>
          </h1>
          <p className="mx-auto mb-8 max-w-lg text-[15px] leading-relaxed text-[#3a5260]">
            MetFin unifies your investments, bank accounts, crypto, and debt into a single intelligent dashboard — with AI insights and scenario planning built in.
          </p>

          {/* sign-in card */}
          <div className="mx-auto inline-flex flex-col items-center gap-3 rounded-2xl border border-[#cae7ee] bg-white px-8 py-6 shadow-[0_8px_40px_rgba(85,178,201,0.13)]">
            <p className="text-[13px] font-semibold text-[#0d1117]">Get started for free</p>
            {authLoading ? (
              <div className="text-[13px] text-[#7a9fad]">Signing in…</div>
            ) : (
              <>
                <GoogleLogin
                  onSuccess={({ credential }) => { if (credential) loginWithGoogle(credential) }}
                  onError={() => console.error('Google login failed')}
                  useOneTap
                  shape="rectangular"
                  theme="outline"
                  size="large"
                  text="signin_with"
                  width="260"
                />
                <div className="flex w-full items-center gap-2">
                  <div className="h-px flex-1 bg-[#e8f0f3]" />
                  <span className="text-[11px] text-[#aac4ce]">or</span>
                  <div className="h-px flex-1 bg-[#e8f0f3]" />
                </div>
                <button
                  onClick={loginAsGuest}
                  className="w-[260px] rounded-md border border-[#cae7ee] bg-[#f7fbfc] py-2.5 text-[13px] font-semibold text-[#3d96ad] transition hover:bg-[#eaf5f8] hover:border-[#3d96ad]"
                >
                  Continue as Guest
                </button>
              </>
            )}
            <p className="text-[11px] text-[#aac4ce]">No credit card required · Private by design</p>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-y border-[#cae7ee] bg-[#f7fbfc]">
        <div className="mx-auto grid max-w-4xl grid-cols-2 divide-x divide-[#cae7ee] sm:grid-cols-4">
          {stats.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center gap-0.5 px-4 py-5">
              <span className="text-[22px] font-extrabold text-[#55b2c9]">{value}</span>
              <span className="text-center text-[11px] text-[#7a9fad]">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-6 py-16 sm:px-10 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-center text-[22px] font-bold text-[#0d1117]">
            Everything you need to master your finances
          </h2>
          <p className="mb-10 text-center text-[13px] text-[#7a9fad]">
            Six powerful modules, one unified platform.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ Icon, color, bg, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-[#cae7ee] bg-white p-5 transition-shadow hover:shadow-[0_4px_20px_rgba(85,178,201,0.10)]"
              >
                <div
                  className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: bg }}
                >
                  <Icon size={18} style={{ color }} />
                </div>
                <div className="mb-1 text-[14px] font-semibold text-[#0d1117]">{title}</div>
                <div className="text-[12px] leading-relaxed text-[#7a9fad]">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="mx-6 mb-16 overflow-hidden rounded-2xl bg-gradient-to-r from-[#1a3a4a] to-[#3d96ad] px-8 py-12 text-center shadow-[0_8px_40px_rgba(85,178,201,0.20)] sm:mx-10">
        <h2 className="mb-2 text-[22px] font-extrabold text-white">
          Ready to take control of your wealth?
        </h2>
        <p className="mb-6 text-[13px] text-[rgba(255,255,255,0.7)]">
          Sign in with Google and get your full financial picture in under 30 seconds.
        </p>
        <div className="flex flex-col items-center gap-3">
          {authLoading ? (
            <span className="text-[13px] text-white/60">Signing in…</span>
          ) : (
            <>
              <div className="rounded-xl overflow-hidden shadow-lg">
                <GoogleLogin
                  onSuccess={({ credential }) => { if (credential) loginWithGoogle(credential) }}
                  onError={() => console.error('Google login failed')}
                  shape="rectangular"
                  theme="filled_blue"
                  size="large"
                  text="signup_with"
                  width="260"
                />
              </div>
              <button
                onClick={loginAsGuest}
                className="w-[260px] rounded-xl border border-white/30 bg-white/10 py-2.5 text-[13px] font-semibold text-white/90 backdrop-blur-sm transition hover:bg-white/20"
              >
                Continue as Guest
              </button>
            </>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#cae7ee] px-6 py-6 text-center text-[11px] text-[#aac4ce]">
        © {new Date().getFullYear()} MetFin · Personal Finance Intelligence · Your data stays private.
      </footer>

    </div>
  )
}

