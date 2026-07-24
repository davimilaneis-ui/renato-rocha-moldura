import { ZOOM_MAX, ZOOM_MIN } from "../hooks/usePhotoTransform";

export default function Controls({
  zoom,
  onZoomChange,
  onRotate,
  onReset,
  onDownload,
  onSwapPhoto,
}) {
  return (
    <div className="flex w-full max-w-[360px] flex-col gap-3 font-grift">
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-white">Zoom</span>
        <input
          type="range"
          min={ZOOM_MIN}
          max={ZOOM_MAX}
          step={0.01}
          value={zoom}
          onChange={(e) => onZoomChange(Number(e.target.value))}
          className="h-2 flex-1 accent-azul-claro"
          aria-label="Zoom da foto"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onRotate}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/70 py-2 text-sm font-medium text-white"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 12a9 9 0 1 1-3.2-6.9" />
            <path d="M21 4v5h-5" />
          </svg>
          Girar 90°
        </button>
        <button
          type="button"
          onClick={onReset}
          className="flex-1 rounded-lg border border-white/70 py-2 text-sm font-medium text-white"
        >
          Centralizar
        </button>
      </div>

      <button
        type="button"
        onClick={onDownload}
        className="w-full rounded-lg bg-azul-claro py-3 text-sm font-bold text-white"
      >
        Baixar minha foto
      </button>

      <button
        type="button"
        onClick={onSwapPhoto}
        className="w-full rounded-lg border border-white/70 py-2.5 text-sm font-medium text-white"
      >
        Trocar foto
      </button>
    </div>
  );
}
