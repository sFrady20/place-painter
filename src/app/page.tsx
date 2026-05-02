"use client";

import { useState, useRef, useCallback } from "react";
import { Card } from "earthling-ui/card";
import { Separator } from "earthling-ui/separator";
import MapCanvas, { type MapCanvasHandle } from "@/components/map-canvas";
import PaintToolbar from "@/components/paint-toolbar";
import ExportButton from "@/components/export-button";
import type { PaintColor } from "@/lib/paint-colors";

type Tool = "brush" | "fill" | "eraser";

export default function PlacePainterPage() {
  const [tool, setTool] = useState<Tool>("brush");
  const [color, setColor] = useState<PaintColor>("green");
  const [brushSize, setBrushSize] = useState(8);
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
    <div className="flex min-h-dvh flex-col items-center px-4 py-6">
      <header className="mb-4 text-center">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Place Painter
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Paint the places you&apos;d live.
        </p>
      </header>

      <div className="w-full max-w-4xl flex-1">
        <MapCanvas
          ref={mapRef}
          tool={tool}
          color={color}
          brushSize={brushSize}
        />
      </div>

      <div className="sticky bottom-4 z-10 mt-4">
        <Card className="flex items-center gap-2 px-3 py-2" material="glass">
          <PaintToolbar
            color={color}
            tool={tool}
            brushSize={brushSize}
            onColorChange={handleColorChange}
            onToolChange={setTool}
            onBrushSizeChange={setBrushSize}
            onReset={handleReset}
          />
          <Separator orientation="vertical" className="mx-1 h-6" />
          <ExportButton mapRef={mapRef} />
        </Card>
      </div>
    </div>
  );
}
