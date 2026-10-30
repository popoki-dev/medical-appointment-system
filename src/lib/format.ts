export const formatCurrency = (amount: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)

export const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(value)

export const formatPercent = (value: number, digits = 1) => `${value.toFixed(digits)}%`
