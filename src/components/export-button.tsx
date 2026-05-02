"use client";

import { useCallback } from "react";
import { Button } from "earthling-ui/button";
import { MAP_VIEWBOX } from "@/lib/us-map-data";
import type { MapCanvasHandle } from "./map-canvas";

const [, , mapW, mapH] = MAP_VIEWBOX.split(" ").map(Number);
const MAP_ASPECT = mapW / mapH;

interface ExportButtonProps {
  mapRef: React.RefObject<MapCanvasHandle | null>;
}

export default function ExportButton({ mapRef }: ExportButtonProps) {
  const handleExport = useCallback(async () => {
    const handle = mapRef.current;
    if (!handle) return;

    const canvas = handle.getCanvasElement();
    const svg = handle.getSvgElement();
    if (!canvas || !svg) return;

    // Output dimensions
    const width = 1440;
    const height = 960;
    const padding = 60;
    const headerHeight = 80;

    const out = document.createElement("canvas");
    out.width = width;
    out.height = height;
    const ctx = out.getContext("2d");
    if (!ctx) return;

    // Background
    const bgColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-background")
      .trim();
    ctx.fillStyle = bgColor || "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Header text
    const fgColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-foreground")
      .trim();
    ctx.fillStyle = fgColor || "#000000";
    ctx.font = "bold 32px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Place Painter", width / 2, padding);

    ctx.font = "18px system-ui, sans-serif";
    ctx.globalAlpha = 0.6;
    ctx.fillText("Places I'd live", width / 2, padding + 30);
    ctx.globalAlpha = 1;

    // Compute destination rect that preserves the map's aspect ratio
    const availW = width - padding * 2;
    const availH = height - headerHeight - padding * 2;
    const availAspect = availW / availH;

    let destW: number, destH: number;
    if (MAP_ASPECT > availAspect) {
      destW = availW;
      destH = availW / MAP_ASPECT;
    } else {
      destH = availH;
      destW = availH * MAP_ASPECT;
    }
    const destX = padding + (availW - destW) / 2;
    const destY = headerHeight + padding / 2 + (availH - destH) / 2;

    // Draw SVG borders
    const svgClone = svg.cloneNode(true) as SVGSVGElement;
    svgClone.setAttribute("width", String(destW));
    svgClone.setAttribute("height", String(destH));

    // Resolve CSS vars for stroke colors
    const resolvedStroke = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-muted-foreground")
      .trim();
    svgClone.querySelectorAll("path").forEach((p) => {
      p.setAttribute("stroke", resolvedStroke || "#a1a1aa");
      p.setAttribute("fill", "none");
    });

    const svgData = new XMLSerializer().serializeToString(svgClone);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);

    const drawSvg = () =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, destX, destY, destW, destH);
          URL.revokeObjectURL(svgUrl);
          resolve();
        };
        img.onerror = () => {
          URL.revokeObjectURL(svgUrl);
          resolve();
        };
        img.src = svgUrl;
      });

    await drawSvg();

    // Draw paint canvas on top at exactly the same rect
    ctx.drawImage(canvas, destX, destY, destW, destH);

    // Color legend at bottom
    const legendY = height - 28;
    const colors = [
      { label: "Yes", hex: "#22c55e" },
      { label: "Maybe", hex: "#eab308" },
      { label: "Maybe not", hex: "#f97316" },
      { label: "No", hex: "#ef4444" },
    ];
    const legendWidth = colors.length * 100;
    const startX = (width - legendWidth) / 2;

    ctx.font = "14px system-ui, sans-serif";
    ctx.textAlign = "left";
    colors.forEach((c, i) => {
      const x = startX + i * 100;
      ctx.fillStyle = c.hex;
      ctx.beginPath();
      ctx.arc(x, legendY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = fgColor || "#000000";
      ctx.globalAlpha = 0.7;
      ctx.fillText(c.label, x + 12, legendY + 5);
      ctx.globalAlpha = 1;
    });

    // Download
    out.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "place-painter.png";
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }, [mapRef]);

  return (
    <Button
      material="ghost"
      scheme="muted"
      shape="icon"
      size="sm"
      onClick={handleExport}
      aria-label="Export as image"
    >
      <span className="icon-[lucide--download] text-base" />
    </Button>
  );
}
