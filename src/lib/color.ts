const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

/**
 * Simple luminance-based black/white pick so any admin-chosen accent stays
 * legible. Kept in its own file (no server-only imports) since it's used
 * directly from a Client Component (the settings form's live preview).
 */
export function getContrastColor(hex: string): "#ffffff" | "#111111" {
  if (!HEX_COLOR_PATTERN.test(hex)) return "#ffffff";
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#111111" : "#ffffff";
}
