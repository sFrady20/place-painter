export type PaintColor = "red" | "orange" | "neutral" | "lightgreen" | "green";

export interface PaintColorConfig {
  label: string;
  hex: string;
  meaning: string;
}

export const PAINT_COLORS: Record<PaintColor, PaintColorConfig> = {
  red: { label: "Red", hex: "#ef4444", meaning: "Never" },
  orange: { label: "Orange", hex: "#f97316", meaning: "Reluctantly" },
  neutral: { label: "Neutral", hex: "#dddddd", meaning: "Maybe" },
  lightgreen: { label: "Light Green", hex: "#86efac", meaning: "Willing" },
  green: { label: "Green", hex: "#22c55e", meaning: "Absolutely" },
};

export const PAINT_COLOR_KEYS: PaintColor[] = [
  "red",
  "orange",
  "neutral",
  "lightgreen",
  "green",
];
