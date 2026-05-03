"use client";

import { useCallback, useState, useEffect } from "react";
import { Button } from "earthling-ui/button";
import { MAP_VIEWBOX } from "@/lib/us-map-data";
import type { MapCanvasHandle } from "./map-canvas";

const [, , mapW, mapH] = MAP_VIEWBOX.split(" ").map(Number);
const MAP_ASPECT = mapW / mapH;

interface ExportButtonProps {
  mapRef: React.RefObject<MapCanvasHandle | null>;
}

async function renderImage(handle: MapCanvasHandle): Promise<Blob | null> {
  const canvas = handle.getCanvasElement();
  const svg = handle.getSvgElement();
  if (!canvas || !svg) return null;

  const width = 1440;
  const height = 960;
  const padding = 60;
  const legendArea = 60;

  const out = document.createElement("canvas");
  out.width = width;
  out.height = height;
  const ctx = out.getContext("2d");
  if (!ctx) return null;

  const bgColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-background")
    .trim();
  ctx.fillStyle = bgColor || "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const fgColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-foreground")
    .trim();

  const availW = width - padding * 2;
  const availH = height - padding - legendArea - padding;
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
  const destY = padding + (availH - destH) / 2;

  // Draw SVG borders
  const svgClone = svg.cloneNode(true) as SVGSVGElement;
  svgClone.setAttribute("width", String(destW));
  svgClone.setAttribute("height", String(destH));
  svgClone.setAttribute("preserveAspectRatio", "xMinYMin meet");

  const resolvedStroke = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-muted-foreground")
    .trim();
  svgClone.querySelectorAll("path").forEach((p) => {
    p.setAttribute("stroke", resolvedStroke || "#a1a1aa");
    p.setAttribute("fill", "none");
  });

  const svgData = new XMLSerializer().serializeToString(svgClone);
  const svgBlob = new Blob([svgData], {
    type: "image/svg+xml;charset=utf-8",
  });
  const svgUrl = URL.createObjectURL(svgBlob);

  await new Promise<void>((resolve) => {
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

  ctx.drawImage(canvas, destX, destY, destW, destH);

  // Legend
  const legendY = height - 40;
  const colors = [
    { label: "Never", hex: "#ef4444" },
    { label: "Reluctantly", hex: "#f97316" },
    { label: "Maybe", hex: "#a3a3a3" },
    { label: "Willing", hex: "#86efac" },
    { label: "Absolutely", hex: "#22c55e" },
  ];
  ctx.font = "bold 22px system-ui, sans-serif";

  // Measure each legend item (dot + gap + text) to compute total width
  const dotRadius = 10;
  const dotTextGap = 14;
  const itemGap = 32;
  const items = colors.map((c) => {
    const textW = ctx.measureText(c.label).width;
    return { ...c, width: dotRadius * 2 + dotTextGap + textW };
  });
  const totalWidth =
    items.reduce((sum, item) => sum + item.width, 0) +
    itemGap * (items.length - 1);
  let curX = (width - totalWidth) / 2;

  ctx.textAlign = "left";
  items.forEach((c) => {
    // Dot
    ctx.fillStyle = c.hex;
    ctx.beginPath();
    ctx.arc(curX + dotRadius, legendY, dotRadius, 0, Math.PI * 2);
    ctx.fill();
    // Label
    ctx.fillStyle = fgColor || "#000000";
    ctx.globalAlpha = 0.8;
    ctx.fillText(c.label, curX + dotRadius * 2 + dotTextGap, legendY + 7);
    ctx.globalAlpha = 1;
    curX += c.width + itemGap;
  });

  // URL watermark
  ctx.font = "16px system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.fillStyle = fgColor || "#000000";
  ctx.globalAlpha = 0.35;
  ctx.fillText("place-painter.vercel.app", width - padding, legendY + 7);
  ctx.globalAlpha = 1;

  return new Promise<Blob | null>((resolve) => {
    out.toBlob((blob) => resolve(blob), "image/png");
  });
}

export default function ExportButton({ mapRef }: ExportButtonProps) {
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    // Check if Web Share API with files is supported
    if (typeof navigator !== "undefined" && navigator.canShare) {
      const testFile = new File([""], "test.png", { type: "image/png" });
      try {
        setCanShare(navigator.canShare({ files: [testFile] }));
      } catch {
        setCanShare(false);
      }
    }
  }, []);

  const handleDownload = useCallback(async () => {
    const handle = mapRef.current;
    if (!handle) return;
    const blob = await renderImage(handle);
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "place-painter.png";
    a.click();
    URL.revokeObjectURL(url);
  }, [mapRef]);

  const handleShare = useCallback(async () => {
    const handle = mapRef.current;
    if (!handle) return;
    const blob = await renderImage(handle);
    if (!blob) return;

    const file = new File([blob], "place-painter.png", { type: "image/png" });
    try {
      await navigator.share({
        files: [file],
        title: "Place Painter",
        text: "Places I'd live",
      });
    } catch {
      // User cancelled or share failed — ignore
    }
  }, [mapRef]);

  return (
    <div className="flex items-center gap-6 sm:gap-2">
      {canShare && (
        <Button
          material="ghost"
          scheme="muted"
          shape="icon"
          size="sm"
          onClick={handleShare}
          aria-label="Share image"
        >
          <span className="icon-[lucide--share-2] text-base" />
          <span className="sm:hidden">Share</span>
        </Button>
      )}
      <Button
        material="ghost"
        scheme="muted"
        shape="icon"
        size="sm"
        onClick={handleDownload}
        aria-label="Download image"
      >
        <span className="icon-[lucide--download] text-base" />
        <span className="sm:hidden">Download</span>
      </Button>
    </div>
  );
}
