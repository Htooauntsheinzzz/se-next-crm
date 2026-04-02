export const formatCurrency = (value: number | null | undefined) => {
  const safeValue = Number.isFinite(value) ? Number(value) : 0;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeValue);
};

export const formatPercentage = (value: number | null | undefined) => {
  const safeValue = Number.isFinite(value) ? Number(value) : 0;
  return `${safeValue.toFixed(1)}%`;
};

export const formatCompactNumber = (value: number | null | undefined) => {
  const safeValue = Number.isFinite(value) ? Number(value) : 0;

  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(safeValue);
};

export const toSafeNumber = (value: number | null | undefined) =>
  Number.isFinite(value) ? Number(value) : 0;
