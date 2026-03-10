import { GoogleLogin } from '@react-oauth/google'
import { useFinanceStore } from '../../store/useFinanceStore'

export function LoginPage() {
  const loginWithGoogle = useFinanceStore((s) => s.loginWithGoogle)
  const authLoading = useFinanceStore((s) => s.authLoading)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#e8f5f8] to-[#f0f8fa]">
      <div className="w-full max-w-sm rounded-2xl border border-[#cae7ee] bg-white p-10 shadow-[0_8px_40px_rgba(85,178,201,0.12)] flex flex-col items-center gap-7">
        {/* Logo / brand */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-3xl font-extrabold tracking-tight text-[#1a3a4a]">
            Met<span className="text-[#55b2c9]">Fin</span>
          </span>
          <span className="text-[13px] text-[#7a9fad]">Personal Finance Intelligence</span>
        </div>

        <div className="h-px w-full bg-[#e0eff3]" />

        <div className="flex flex-col items-center gap-3 w-full">
          <p className="text-[13px] text-[#3a5260] font-medium">Sign in to continue</p>
          {authLoading ? (
            <div className="text-[13px] text-[#7a9fad]">Signing in…</div>
          ) : (
            <GoogleLogin
              onSuccess={({ credential }) => {
                if (credential) loginWithGoogle(credential)
              }}
              onError={() => {
                console.error('Google login failed')
              }}
              useOneTap
              shape="rectangular"
              theme="outline"
              size="large"
              text="signin_with"
              width="260"
            />
          )}
        </div>

        <p className="text-center text-[11px] text-[#aac4ce]">
          Your data stays private — we never store it externally.
        </p>
      </div>
    </div>
  )
}
