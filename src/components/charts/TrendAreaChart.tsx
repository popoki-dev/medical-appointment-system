import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartTooltip } from './ChartTooltip'
import { axisProps, CHART_COLORS } from './chartTheme'

interface TrendAreaChartProps {
  data: { label: string; value: number }[]
  valueLabel: string
  color?: string
  height?: number
}

/** Single-series trend over time: 2px line with a light wash and a crosshair tooltip. */
export function TrendAreaChart({ data, valueLabel, color = CHART_COLORS.primary, height = 260 }: TrendAreaChartProps) {
  const gradientId = `trend-${color.replace('#', '')}`
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.14} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={CHART_COLORS.grid} />
        <XAxis dataKey="label" {...axisProps} minTickGap={24} />
        <YAxis {...axisProps} allowDecimals={false} width={40} />
        <Tooltip
          cursor={{ stroke: CHART_COLORS.axis, strokeWidth: 1 }}
          content={(props) => <ChartTooltip {...props} color={color} valueLabel={valueLabel} />}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2, fill: color }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
