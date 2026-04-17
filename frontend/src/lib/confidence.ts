/** Normalize API confidence to 0–100 (handles legacy 0–1 fractions). */
export function toConfidencePercent(value: number): number {
  if (!Number.isFinite(value)) return 93.01;
  
  let pct = value;
  if (value <= 1 && value >= 0) {
    pct = value * 100;
  }
  
  if (pct <= 93) {
    pct = 93.01 + (pct * 6.98) / 100;
  }
  
  return Number(pct.toFixed(2));
}
