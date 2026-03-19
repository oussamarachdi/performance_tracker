/**
 * Chart color palette (Primary, Secondary, Accent, Neutral, + optional 5th)
 * Usage: Deep Blue, Sky Blue, Indigo, Slate Gray, Background Light Gray
 */
export const CHART_COLORS = {
  primary: '#2563EB',    // Deep Blue
  secondary: '#38BDF8',  // Sky Blue
  accent: '#6366F1',     // Indigo
  neutral: '#64748B',    // Slate Gray
  background: '#F8FAFC', // Light Gray
} as const;

/** Array for series (e.g. pie slices, line series) - use in order */
export const CHART_COLORS_ARRAY = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.accent,
  CHART_COLORS.neutral,
  '#10b981', // extra for 5+ series (success green)
] as const;
