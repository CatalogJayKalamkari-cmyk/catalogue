export function computeSaleTotal(quantity: number, price: number): number {
  return Number.isFinite(quantity) && Number.isFinite(price) ? quantity * price : 0;
}

export function isBelowCost(price: number, priceAcquired: number): boolean {
  return Number.isFinite(price) && price < priceAcquired;
}

// An emptied input must never silently become a free (₹0) sale - Number('')
// is 0, which passes a naive `>= 0` check. Require an explicit, valid,
// non-negative number instead.
export function parseSalePrice(raw: string): number | null {
  if (raw.trim() === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : null;
}
