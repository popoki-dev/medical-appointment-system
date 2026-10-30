interface ChartTooltipProps {
  active?: boolean
  payload?: { value?: number | string | (number | string)[] }[]
  label?: string | number
  color: string
  valueLabel: string
}

export function ChartTooltip({ active, payload, label, color, valueLabel }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-xs shadow-elevated">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      <p className="flex items-center gap-2 text-muted-foreground">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        {valueLabel}
        <span className="ml-auto pl-3 font-semibold tabular-nums text-foreground">{String(payload[0].value ?? '')}</span>
      </p>
    </div>
  )
}
