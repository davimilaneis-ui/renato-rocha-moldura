import { useCallback, useMemo, useRef, useState } from "react";

export const ZOOM_MIN = 0.5;
export const ZOOM_MAX = 3;
export const CANVAS_SIZE = 1080;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function usePhotoTransform({ canvasRef, imageSize }) {
  const [zoom, setZoomState] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const pointers = useRef(new Map());
  const dragStart = useRef(null);
  const pinchStart = useRef(null);

  const coverScale = useMemo(() => {
    if (!imageSize) return 1;
    return Math.max(CANVAS_SIZE / imageSize.width, CANVAS_SIZE / imageSize.height);
  }, [imageSize]);

  const clampPan = useCallback(
    (candidate, z) => {
      if (!imageSize) return { x: 0, y: 0 };
      const drawnW = imageSize.width * coverScale * z;
      const drawnH = imageSize.height * coverScale * z;
      const maxX = Math.max(0, (drawnW - CANVAS_SIZE) / 2);
      const maxY = Math.max(0, (drawnH - CANVAS_SIZE) / 2);
      return { x: clamp(candidate.x, -maxX, maxX), y: clamp(candidate.y, -maxY, maxY) };
    },
    [imageSize, coverScale]
  );

  const setZoom = useCallback(
    (nextZoom) => {
      setZoomState((prevZoom) => {
        const z = clamp(typeof nextZoom === "function" ? nextZoom(prevZoom) : nextZoom, ZOOM_MIN, ZOOM_MAX);
        setPan((prevPan) => clampPan(prevPan, z));
        return z;
      });
    },
    [clampPan]
  );

  const reset = useCallback(() => {
    setZoomState(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const screenToCanvasRatio = useCallback(() => {
    const el = canvasRef.current;
    if (!el) return 1;
    const rect = el.getBoundingClientRect();
    if (!rect.width) return 1;
    return CANVAS_SIZE / rect.width;
  }, [canvasRef]);

  const onPointerDown = useCallback((e) => {
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch (err) {
      console.warn("setPointerCapture failed", err);
    }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 1) {
      dragStart.current = { pointerStart: { x: e.clientX, y: e.clientY }, panStart: pan };
      pinchStart.current = null;
    } else if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinchStart.current = {
        distance: Math.hypot(a.x - b.x, a.y - b.y),
        zoomStart: zoom,
      };
      dragStart.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pan, zoom]);

  const onPointerMove = useCallback(
    (e) => {
      if (!pointers.current.has(e.pointerId)) return;
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointers.current.size === 2 && pinchStart.current) {
        const [a, b] = [...pointers.current.values()];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        const ratio = distance / pinchStart.current.distance;
        setZoom(pinchStart.current.zoomStart * ratio);
        return;
      }

      if (pointers.current.size === 1 && dragStart.current) {
        const ratio = screenToCanvasRatio();
        const dx = (e.clientX - dragStart.current.pointerStart.x) * ratio;
        const dy = (e.clientY - dragStart.current.pointerStart.y) * ratio;
        const candidate = {
          x: dragStart.current.panStart.x + dx,
          y: dragStart.current.panStart.y + dy,
        };
        setPan(clampPan(candidate, zoom));
      }
    },
    [clampPan, screenToCanvasRatio, setZoom, zoom]
  );

  const endPointer = useCallback((e) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 1) {
      const [remaining] = [...pointers.current.values()];
      dragStart.current = { pointerStart: remaining, panStart: pan };
      pinchStart.current = null;
    } else if (pointers.current.size === 0) {
      dragStart.current = null;
      pinchStart.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pan]);

  const handlers = {
    onPointerDown,
    onPointerMove,
    onPointerUp: endPointer,
    onPointerCancel: endPointer,
    onPointerLeave: endPointer,
  };

  return { zoom, setZoom, pan, reset, handlers, coverScale };
}
