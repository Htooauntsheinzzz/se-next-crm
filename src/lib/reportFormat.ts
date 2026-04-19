export const formatCurrency = (value: number | null | undefined): string => {
  const safeValue = Number.isFinite(value) ? Number(value) : 0;

  if (safeValue >= 1_000_000) {
    return `$${(safeValue / 1_000_000).toFixed(2)}M`;
  }

  if (safeValue >= 1_000) {
    return `$${(safeValue / 1_000).toFixed(0)}K`;
  }

  return `$${safeValue.toFixed(0)}`;
};

export const formatShortCurrency = (value: number | null | undefined): string => {
  const safeValue = Number.isFinite(value) ? Number(value) : 0;

  if (safeValue >= 1_000_000) {
    return `$${(safeValue / 1_000_000).toFixed(1)}M`;
  }

  if (safeValue >= 1_000) {
    return `$${(safeValue / 1_000).toFixed(0)}K`;
  }

  return `$${safeValue.toFixed(0)}`;
};

export const formatPercent = (value: number | null | undefined, digits = 1): string => {
  const safeValue = Number.isFinite(value) ? Number(value) : 0;
  return `${safeValue.toFixed(digits)}%`;
};

export const toSafeNumber = (value: number | null | undefined): number =>
  Number.isFinite(value) ? Number(value) : 0;

export const getInitials = (value: string): string => {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "U";
  }
  return `${parts[0]?.charAt(0) ?? ""}${parts[1]?.charAt(0) ?? ""}`.toUpperCase();
};

export const downloadJson = (filename: string, data: unknown) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const downloadCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
  const csvContent = [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(","),
    ...rows.map(row => 
      row.map(val => `"${String(val ?? "").replace(/"/g, '""')}"`).join(",")
    )
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" }); // \uFEFF is BOM for Excel UTF-8 support
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
