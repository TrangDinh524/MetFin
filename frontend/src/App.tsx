import { Layout } from './components/layout/Layout'
import { LoginPage } from './features/auth/LoginPage'
import { useFinanceStore } from './store/useFinanceStore'

export default function App() {
  const user = useFinanceStore((s) => s.user)
  if (!user) return <LoginPage />
  return <Layout />
}
