export type PaintColor = "red" | "orange" | "yellow" | "green";

export interface PaintColorConfig {
  label: string;
  hex: string;
  meaning: string;
}

export const PAINT_COLORS: Record<PaintColor, PaintColorConfig> = {
  red: { label: "Red", hex: "#ef4444", meaning: "No" },
  orange: { label: "Orange", hex: "#f97316", meaning: "Maybe not" },
  yellow: { label: "Yellow", hex: "#eab308", meaning: "Maybe" },
  green: { label: "Green", hex: "#22c55e", meaning: "Yes" },
};

export const PAINT_COLOR_KEYS: PaintColor[] = ["red", "orange", "yellow", "green"];
