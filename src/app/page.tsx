"use client";

import { useState, useRef, useCallback } from "react";
import { Card } from "earthling-ui/card";
import { Separator } from "earthling-ui/separator";
import MapCanvas, { type MapCanvasHandle } from "@/components/map-canvas";
import PaintToolbar from "@/components/paint-toolbar";
import ExportButton from "@/components/export-button";
import {
  PAINT_COLORS,
  PAINT_COLOR_KEYS,
  type PaintColor,
} from "@/lib/paint-colors";

type Tool = "brush" | "fill" | "eraser";

export default function PlacePainterPage() {
  const [tool, setTool] = useState<Tool>("fill");
  const [color, setColor] = useState<PaintColor>("green");
  const [brushSize, setBrushSize] = useState(12);
  const mapRef = useRef<MapCanvasHandle>(null);

  const handleColorChange = useCallback((c: PaintColor) => {
    setColor(c);
    // Stay in current tool mode — only switch away from eraser
    setTool((prev) => (prev === "eraser" ? "brush" : prev));
  }, []);

  const handleReset = useCallback(() => {
    mapRef.current?.clear();
  }, []);

  return (
    <div className="flex min-h-dvh flex-col px-2 py-4 sm:px-4">
      {/* Map — centered in remaining space */}
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-4xl">
          <MapCanvas
            ref={mapRef}
            tool={tool}
            color={color}
            brushSize={brushSize}
          />
        </div>
      </div>

      {/* Bottom bar — legend + toolbar + footer */}
      <div className="flex flex-col items-center gap-2 pb-2">
        {/* Legend */}
        <div className="flex flex-col flex-wrap justify-center gap-x-4 gap-y-1 self-end sm:flex-row sm:self-center">
          {PAINT_COLOR_KEYS.map((key) => (
            <div key={key} className="flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: PAINT_COLORS[key].hex }}
              />
              <span className="text-muted-foreground text-xs">
                {PAINT_COLORS[key].meaning}
              </span>
            </div>
          ))}
        </div>

        <Card className="w-full px-2 py-2 sm:w-auto sm:px-3" material="glass">
          <div className="flex flex-col items-center gap-2 sm:flex-row">
            <PaintToolbar
              color={color}
              tool={tool}
              brushSize={brushSize}
              onColorChange={handleColorChange}
              onToolChange={setTool}
              onBrushSizeChange={setBrushSize}
              onReset={handleReset}
            />
            <Separator
              orientation="vertical"
              className="mx-1 hidden h-6 sm:block"
            />
            <Separator orientation="horizontal" className="w-full sm:hidden" />
            <ExportButton mapRef={mapRef} />
          </div>
        </Card>

        <footer className="text-muted-foreground text-xs">
          Made by{" "}
          <a
            href="https://x.com/slowjamsteve"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground underline underline-offset-2"
          >
            Steven Frady
          </a>
        </footer>
      </div>
    </div>
  );
}
