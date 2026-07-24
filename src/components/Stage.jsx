import { useEffect, useRef, useState } from "react";
import { CANVAS_SIZE } from "../hooks/usePhotoTransform";
import { useMaskImage } from "../hooks/useMaskImage";

export default function Stage({ canvasRef, photo, zoom, rotation, pan, coverScale, handlers, onFileDropped, onTapUpload }) {
  const mask = useMaskImage();
  const [isDragOver, setIsDragOver] = useState(false);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: false });

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      ctx.fillStyle = "#FDF8F0";
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      if (photo) {
        const scale = coverScale * zoom;
        const drawnW = photo.width * scale;
        const drawnH = photo.height * scale;
        const cx = CANVAS_SIZE / 2 + pan.x;
        const cy = CANVAS_SIZE / 2 + pan.y;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(photo.bitmap, -drawnW / 2, -drawnH / 2, drawnW, drawnH);
        ctx.restore();
      }

      if (mask) {
        ctx.drawImage(mask, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
      }
    });

    return () => cancelAnimationFrame(rafRef.current);
  }, [canvasRef, photo, zoom, rotation, pan, coverScale, mask]);

  function handleDrop(e) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileDropped(file);
  }

  return (
    <div
      className="relative aspect-square w-full select-none touch-none lg:h-full lg:w-auto"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      onClick={!photo ? onTapUpload : undefined}
      {...(photo ? handlers : {})}
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className={`h-full w-full ${photo ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}`}
      />
      {/* Inset approximates the mask's transparent circle so the hint/drag ring
          don't cover the frame's logo and watermark artwork outside it. */}
      {!photo && (
        <div
          className="pointer-events-none absolute flex flex-col items-center justify-center gap-2 text-center"
          style={{ top: "7%", bottom: "17%", left: "9%", right: "12%" }}
        >
          <span className="rounded-lg bg-verde px-4 py-2 text-sm font-medium text-white">
            Clique aqui para anexar sua foto
          </span>
        </div>
      )}
      {isDragOver && (
        <div
          className="pointer-events-none absolute rounded-full border-4 border-dashed border-azul"
          style={{ top: "7%", bottom: "17%", left: "9%", right: "12%" }}
        />
      )}
    </div>
  );
}
