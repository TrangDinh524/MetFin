/**
 * Maps backend icon name strings → lucide-react components.
 * The backend sends icon names like "Zap", "AlertTriangle", etc.
 */
import {
  Zap,
  AlertTriangle,
  Target,
  RefreshCw,
  Shield,
  TrendingDown,
  Building,
  Activity,
  type LucideIcon,
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  Zap,
  AlertTriangle,
  Target,
  RefreshCw,
  Shield,
  TrendingDown,
  Building,
  Activity,
}

export function getIcon(name: string): LucideIcon {
  return iconMap[name] ?? Activity
}
