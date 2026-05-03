"use client";

import {
  useRef,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import { US_STATES, MAP_VIEWBOX } from "@/lib/us-map-data";
import { PAINT_COLORS, type PaintColor } from "@/lib/paint-colors";

export interface MapCanvasHandle {
  clear: () => void;
  getCanvasElement: () => HTMLCanvasElement | null;
  getSvgElement: () => SVGSVGElement | null;
}

interface MapCanvasProps {
  tool: "brush" | "fill" | "eraser";
  color: PaintColor;
  brushSize: number;
}

// Parse viewBox
const [vbX, vbY, vbW, vbH] = MAP_VIEWBOX.split(" ").map(Number);

const MapCanvas = forwardRef<MapCanvasHandle, MapCanvasProps>(
  function MapCanvas({ tool, color, brushSize }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isPainting = useRef(false);
    const lastPoint = useRef<{ x: number; y: number } | null>(null);
    const statePaths = useRef<Map<string, Path2D>>(new Map());
    const clipPath = useRef<Path2D | null>(null);

    // Build Path2D objects once
    useEffect(() => {
      const map = new Map<string, Path2D>();
      const combined = new Path2D();
      for (const state of US_STATES) {
        const p = new Path2D(state.path);
        map.set(state.id, p);
        combined.addPath(p);
      }
      statePaths.current = map;
      clipPath.current = combined;
    }, []);

    // Setup canvas dimensions
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = vbW * dpr;
      canvas.height = vbH * dpr;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);
      // Translate so SVG path coordinates (which start at vbX,vbY) align with canvas origin
      ctx.translate(-vbX, -vbY);

      // Apply clip to map outline
      if (clipPath.current) {
        ctx.save();
        ctx.clip(clipPath.current);

        // Fill all states with neutral color
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = PAINT_COLORS.neutral.hex;
        ctx.fill(clipPath.current);
      }
    }, []);

    // Convert pointer event to map coordinates
    const toMapCoords = useCallback(
      (e: PointerEvent): { x: number; y: number } => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const scaleX = vbW / rect.width;
        const scaleY = vbH / rect.height;
        return {
          x: (e.clientX - rect.left) * scaleX + vbX,
          y: (e.clientY - rect.top) * scaleY + vbY,
        };
      },
      [],
    );

    // Draw a brush dot
    const drawDot = useCallback(
      (x: number, y: number, erasing: boolean) => {
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;

        if (erasing) {
          ctx.globalCompositeOperation = "destination-out";
          ctx.fillStyle = "rgba(0,0,0,1)";
        } else {
          ctx.globalCompositeOperation = "source-over";
          ctx.fillStyle = PAINT_COLORS[color].hex;
        }

        ctx.beginPath();
        ctx.arc(x, y, brushSize, 0, Math.PI * 2);
        ctx.fill();
      },
      [color, brushSize],
    );

    // Interpolate between two points for smooth strokes
    const drawLine = useCallback(
      (
        from: { x: number; y: number },
        to: { x: number; y: number },
        erasing: boolean,
      ) => {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const step = Math.max(brushSize * 0.3, 1);
        const steps = Math.ceil(dist / step);

        for (let i = 0; i <= steps; i++) {
          const t = steps === 0 ? 0 : i / steps;
          drawDot(from.x + dx * t, from.y + dy * t, erasing);
        }
      },
      [drawDot, brushSize],
    );

    // Fill a state
    const fillState = useCallback(
      (x: number, y: number, erasing: boolean) => {
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;

        // isPointInPath expects coordinates in the final canvas pixel space
        // (unaffected by CTM), so convert from viewBox coords
        const dpr = window.devicePixelRatio || 1;
        const hitX = (x - vbX) * dpr;
        const hitY = (y - vbY) * dpr;

        // Find which state contains the point
        for (const state of US_STATES) {
          const path = statePaths.current.get(state.id);
          if (path && ctx.isPointInPath(path, hitX, hitY)) {
            if (erasing) {
              ctx.globalCompositeOperation = "destination-out";
              ctx.fillStyle = "rgba(0,0,0,1)";
            } else {
              ctx.globalCompositeOperation = "source-over";
              ctx.fillStyle = PAINT_COLORS[color].hex;
            }
            ctx.fill(path);
            break;
          }
        }
      },
      [color],
    );

    // Pointer handlers
    const handlePointerDown = useCallback(
      (e: React.PointerEvent) => {
        isPainting.current = true;
        const pt = toMapCoords(e.nativeEvent);
        lastPoint.current = pt;

        if (tool === "fill") {
          fillState(pt.x, pt.y, false);
        } else if (tool === "eraser") {
          if (e.nativeEvent.pointerType !== "touch" || true) {
            drawDot(pt.x, pt.y, true);
          }
        } else {
          drawDot(pt.x, pt.y, false);
        }

        // Capture pointer for reliable tracking
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      },
      [tool, toMapCoords, drawDot, fillState],
    );

    const handlePointerMove = useCallback(
      (e: React.PointerEvent) => {
        if (!isPainting.current) return;
        if (tool === "fill") return;

        const pt = toMapCoords(e.nativeEvent);
        const erasing = tool === "eraser";

        if (lastPoint.current) {
          drawLine(lastPoint.current, pt, erasing);
        } else {
          drawDot(pt.x, pt.y, erasing);
        }

        lastPoint.current = pt;
      },
      [tool, toMapCoords, drawDot, drawLine],
    );

    const handlePointerUp = useCallback(() => {
      isPainting.current = false;
      lastPoint.current = null;
    }, []);

    // Expose handle for parent
    useImperativeHandle(ref, () => ({
      clear: () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Need to temporarily remove clip to clear entire canvas
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();

        // Re-setup with translate and clip
        const dpr = window.devicePixelRatio || 1;
        canvas.width = vbW * dpr;
        canvas.height = vbH * dpr;
        ctx.scale(dpr, dpr);
        ctx.translate(-vbX, -vbY);
        if (clipPath.current) {
          ctx.clip(clipPath.current);
          // Refill with neutral
          ctx.globalCompositeOperation = "source-over";
          ctx.fillStyle = PAINT_COLORS.neutral.hex;
          ctx.fill(clipPath.current);
        }
      },
      getCanvasElement: () => canvasRef.current,
      getSvgElement: () => svgRef.current,
    }));

    return (
      <div
        ref={containerRef}
        className="relative w-full"
        style={{ aspectRatio: `${vbW} / ${vbH}` }}
      >
        {/* SVG state borders (background) */}
        <svg
          ref={svgRef}
          viewBox={MAP_VIEWBOX}
          preserveAspectRatio="xMinYMin meet"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          {/* Outer border — all states as one combined path */}
          <path
            d={US_STATES.map((s) => s.path).join(" ")}
            fill="none"
            className="stroke-muted-foreground/60"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
          {/* Inner state borders */}
          {US_STATES.map((state) => (
            <path
              key={state.id}
              d={state.path}
              fill="none"
              className="stroke-muted-foreground/20"
              strokeWidth={0.5}
            />
          ))}
        </svg>

        {/* Canvas paint layer */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full touch-none select-none"
          style={{ cursor: tool === "fill" ? "crosshair" : "default" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
      </div>
    );
  },
);

export default MapCanvas;
