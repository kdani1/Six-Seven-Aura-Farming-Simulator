const UNITS = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No"] as const;

export function formatAura(value: number): string {
  if (!Number.isFinite(value)) return "∞";
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (abs < 1000) return `${sign}${abs < 10 ? abs.toFixed(abs % 1 === 0 ? 0 : 1) : Math.floor(abs).toLocaleString("hu-HU")}`;

  const exp = Math.min(Math.floor(Math.log10(abs) / 3), UNITS.length - 1);
  const scaled = abs / 10 ** (exp * 3);
  const digits = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2;
  return `${sign}${scaled.toFixed(digits)}${UNITS[exp]}`;
}

export function formatRate(value: number): string {
  if (value <= 0) return "0/mp";
  if (value < 0.1) return `${value.toFixed(2)}/mp`;
  return `${formatAura(value)}/mp`;
}

export function formatInteger(value: number): string {
  return Math.floor(value).toLocaleString("hu-HU");
}
