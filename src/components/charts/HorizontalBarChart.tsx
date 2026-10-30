import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartTooltip } from './ChartTooltip'
import { axisProps, CHART_COLORS } from './chartTheme'

interface HorizontalBarChartProps {
  data: { label: string; value: number }[]
  valueLabel: string
  color?: string
}

/** Single-series ranked bars with the value at each bar tip. */
export function HorizontalBarChart({ data, valueLabel, color = CHART_COLORS.secondary }: HorizontalBarChartProps) {
  const height = Math.max(160, data.length * 40 + 24)
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 32, left: 0, bottom: 0 }} barCategoryGap={8}>
        <CartesianGrid horizontal={false} stroke={CHART_COLORS.grid} />
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis type="category" dataKey="label" {...axisProps} width={120} />
        <Tooltip
          cursor={{ fill: CHART_COLORS.grid, fillOpacity: 0.4 }}
          content={(props) => <ChartTooltip {...props} color={color} valueLabel={valueLabel} />}
        />
        <Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]} maxBarSize={20}>
          <LabelList dataKey="value" position="right" fill={CHART_COLORS.axis} fontSize={12} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
