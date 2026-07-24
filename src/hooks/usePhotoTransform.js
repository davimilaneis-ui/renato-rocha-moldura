import { useCallback, useMemo, useRef, useState } from "react";

export const ZOOM_MIN = 0.5;
export const ZOOM_MAX = 3;
export const ROTATION_MIN = -45;
export const ROTATION_MAX = 45;
export const CANVAS_SIZE = 1080;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// Axis-aligned bounding box of a w x h rectangle rotated by angleDeg around its center.
function rotatedBBox(w, h, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  return { width: w * cos + h * sin, height: w * sin + h * cos };
}

export function usePhotoTransform({ canvasRef, imageSize }) {
  const [zoom, setZoomState] = useState(1);
  const [rotation, setRotationState] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const pointers = useRef(new Map());
  const dragStart = useRef(null);
  const pinchStart = useRef(null);

  const coverScale = useMemo(() => {
    if (!imageSize) return 1;
    const bbox = rotatedBBox(imageSize.width, imageSize.height, rotation);
    return Math.max(CANVAS_SIZE / bbox.width, CANVAS_SIZE / bbox.height);
  }, [imageSize, rotation]);

  const clampPan = useCallback(
    (candidate, z, rot) => {
      if (!imageSize) return { x: 0, y: 0 };
      const scaledW = imageSize.width * coverScale * z;
      const scaledH = imageSize.height * coverScale * z;
      const bbox = rotatedBBox(scaledW, scaledH, rot);
      const maxX = Math.max(0, (bbox.width - CANVAS_SIZE) / 2);
      const maxY = Math.max(0, (bbox.height - CANVAS_SIZE) / 2);
      return { x: clamp(candidate.x, -maxX, maxX), y: clamp(candidate.y, -maxY, maxY) };
    },
    [imageSize, coverScale]
  );

  const setZoom = useCallback(
    (nextZoom) => {
      setZoomState((prevZoom) => {
        const z = clamp(typeof nextZoom === "function" ? nextZoom(prevZoom) : nextZoom, ZOOM_MIN, ZOOM_MAX);
        setRotationState((prevRotation) => {
          setPan((prevPan) => clampPan(prevPan, z, prevRotation));
          return prevRotation;
        });
        return z;
      });
    },
    [clampPan]
  );

  const setRotation = useCallback(
    (nextRotation) => {
      setRotationState((prevRotation) => {
        const rot = clamp(
          typeof nextRotation === "function" ? nextRotation(prevRotation) : nextRotation,
          ROTATION_MIN,
          ROTATION_MAX
        );
        setZoomState((prevZoom) => {
          setPan((prevPan) => clampPan(prevPan, prevZoom, rot));
          return prevZoom;
        });
        return rot;
      });
    },
    [clampPan]
  );

  const reset = useCallback(() => {
    setZoomState(1);
    setRotationState(0);
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
        setPan(clampPan(candidate, zoom, rotation));
      }
    },
    [clampPan, screenToCanvasRatio, setZoom, zoom, rotation]
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

  return { zoom, setZoom, rotation, setRotation, pan, reset, handlers, coverScale };
}
