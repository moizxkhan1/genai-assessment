export function formatPercent(value: number, digits = 1) {
  return `${value.toFixed(digits)}%`;
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value);
}

export function normalizeSentimentTo100(sentiment: number) {
  const n = (sentiment + 1) * 50;
  return Math.max(0, Math.min(100, n));
}
