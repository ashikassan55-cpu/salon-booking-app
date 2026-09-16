/**
 * Single source of truth for price display — this salon operates in the
 * UAE, so all prices are AED. Changing currency for a different client
 * deployment means editing only this file.
 */
const formatter = new Intl.NumberFormat("en-AE", {
  style: "currency",
  currency: "AED",
});

const formatterNoDecimals = new Intl.NumberFormat("en-AE", {
  style: "currency",
  currency: "AED",
  minimumFractionDigits: 0,
});

export function formatCurrency(amount: number, decimals: boolean = true) {
  return (decimals ? formatter : formatterNoDecimals).format(amount);
}
