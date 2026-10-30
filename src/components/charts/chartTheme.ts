/** Shared chart styling. Series colours are the brand primary and secondary. */
export const CHART_COLORS = {
  primary: '#2563EB',
  secondary: '#0D9488',
  grid: '#E2E8F0',
  axis: '#64748B',
} as const

export const axisProps = {
  tick: { fill: CHART_COLORS.axis, fontSize: 12 },
  tickLine: false,
  axisLine: false,
} as const
