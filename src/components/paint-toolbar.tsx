"use client";

import { Button } from "earthling-ui/button";
import { Separator } from "earthling-ui/separator";
import { PAINT_COLORS, PAINT_COLOR_KEYS, type PaintColor } from "@/lib/paint-colors";

type Tool = "brush" | "fill" | "eraser";

interface PaintToolbarProps {
  color: PaintColor;
  tool: Tool;
  brushSize: number;
  onColorChange: (color: PaintColor) => void;
  onToolChange: (tool: Tool) => void;
  onBrushSizeChange: (size: number) => void;
  onReset: () => void;
}

export default function PaintToolbar({
  color,
  tool,
  brushSize,
  onColorChange,
  onToolChange,
  onBrushSizeChange,
  onReset,
}: PaintToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {/* Color swatches */}
      <div className="flex items-center gap-1.5">
        {PAINT_COLOR_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => onColorChange(key)}
            className={`h-9 w-9 rounded-full border-2 transition-all ${
              color === key && tool !== "eraser"
                ? "scale-110 border-foreground ring-2 ring-foreground/20"
                : "border-transparent hover:scale-105"
            }`}
            style={{ backgroundColor: PAINT_COLORS[key].hex }}
            aria-label={`${PAINT_COLORS[key].label} - ${PAINT_COLORS[key].meaning}`}
            aria-pressed={color === key && tool !== "eraser"}
          />
        ))}
      </div>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Tool buttons */}
      <div className="flex items-center gap-1">
        <Button
          material={tool === "brush" ? "paper" : "ghost"}
          scheme="muted"
          shape="icon"
          size="sm"
          onClick={() => onToolChange("brush")}
          aria-pressed={tool === "brush"}
          aria-label="Brush"
        >
          <span className="icon-[lucide--paintbrush] text-base" />
        </Button>
        <Button
          material={tool === "fill" ? "paper" : "ghost"}
          scheme="muted"
          shape="icon"
          size="sm"
          onClick={() => onToolChange("fill")}
          aria-pressed={tool === "fill"}
          aria-label="Fill state"
        >
          <span className="icon-[lucide--paint-bucket] text-base" />
        </Button>
        <Button
          material={tool === "eraser" ? "paper" : "ghost"}
          scheme="muted"
          shape="icon"
          size="sm"
          onClick={() => onToolChange("eraser")}
          aria-pressed={tool === "eraser"}
          aria-label="Eraser"
        >
          <span className="icon-[lucide--eraser] text-base" />
        </Button>
      </div>

      {/* Brush size (only for brush/eraser) */}
      {(tool === "brush" || tool === "eraser") && (
        <>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <div className="flex items-center gap-1">
            <Button
              material="ghost"
              scheme="muted"
              shape="icon"
              size="sm"
              onClick={() => onBrushSizeChange(Math.max(2, brushSize - 2))}
              aria-label="Decrease brush size"
            >
              <span className="icon-[lucide--minus] text-sm" />
            </Button>
            <span className="text-muted-foreground w-6 text-center text-xs">
              {brushSize}
            </span>
            <Button
              material="ghost"
              scheme="muted"
              shape="icon"
              size="sm"
              onClick={() => onBrushSizeChange(Math.min(30, brushSize + 2))}
              aria-label="Increase brush size"
            >
              <span className="icon-[lucide--plus] text-sm" />
            </Button>
          </div>
        </>
      )}

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Reset */}
      <Button
        material="ghost"
        scheme="bad"
        shape="icon"
        size="sm"
        onClick={onReset}
        aria-label="Reset map"
      >
        <span className="icon-[lucide--rotate-ccw] text-base" />
      </Button>
    </div>
  );
}
