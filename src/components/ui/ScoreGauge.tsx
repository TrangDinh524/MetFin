const COLORS = {
  light: '#cae7ee',
  text: '#0d1117',
  mint: '#1cb08a',
  primary: '#55b2c9',
  amber: '#d4860a',
  rose: '#d44a4a',
}

interface ScoreGaugeProps {
  score: number
  size?: number
}

export function ScoreGauge({ score, size = 160 }: ScoreGaugeProps) {
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.38
  const circ = 2 * Math.PI * r
  const span = 0.78
  const trackLen = circ * span
  const scoreLen = (score / 100) * trackLen
  const col =
    score >= 80 ? COLORS.mint : score >= 60 ? COLORS.primary : score >= 40 ? COLORS.amber : COLORS.rose
  const lbl =
    score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Poor'
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`rotate(-126,${cx},${cy})`}>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={COLORS.light}
          strokeWidth={size * 0.055}
          strokeLinecap="round"
          strokeDasharray={`${trackLen} ${circ - trackLen}`}
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={col}
          strokeWidth={size * 0.055}
          strokeLinecap="round"
          strokeDasharray={`${scoreLen} ${circ - scoreLen}`}
          style={{ transition: 'stroke-dasharray .5s' }}
        />
      </g>
      <text
        x={cx}
        y={cy - 3}
        textAnchor="middle"
        fill={COLORS.text}
        fontSize={size * 0.22}
        fontWeight="700"
        fontFamily="'Public Sans', 'Segoe UI', sans-serif"
      >
        {score}
      </text>
      <text
        x={cx}
        y={cy + 17}
        textAnchor="middle"
        fill={col}
        fontSize={size * 0.085}
        fontFamily="'Public Sans', 'Segoe UI', sans-serif"
        fontWeight="600"
      >
        {lbl}
      </text>
    </svg>
  )
}
