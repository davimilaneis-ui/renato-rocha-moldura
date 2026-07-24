import { useCallback, useRef, useState } from "react";
import Stage from "./components/Stage";
import Controls from "./components/Controls";
import TricolorBar from "./components/TricolorBar";
import Hero from "./components/Hero";
import CanvasCard from "./components/CanvasCard";
import { usePhotoTransform } from "./hooks/usePhotoTransform";
import { loadOrientedImage } from "./utils/loadOrientedImage";
import { validateFile } from "./utils/validateFile";
import { downloadCanvasAsPng } from "./utils/download";

export default function App() {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [photo, setPhoto] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [fallbackUrl, setFallbackUrl] = useState(null);
  const [showPostDownload, setShowPostDownload] = useState(false);

  const { zoom, setZoom, rotation, setRotation, pan, reset, handlers, coverScale } = usePhotoTransform({
    canvasRef,
    imageSize: photo,
  });

  const handleFile = useCallback(
    async (file) => {
      setError(null);
      setShowPostDownload(false);
      setFallbackUrl(null);

      const validation = validateFile(file);
      if (!validation.ok) {
        setError(validation.error);
        return;
      }

      setIsProcessing(true);
      try {
        const oriented = await loadOrientedImage(file);
        setPhoto(oriented);
        reset();
      } catch {
        setError("Não foi possível ler essa foto. Tente outra imagem.");
      } finally {
        setIsProcessing(false);
      }
    },
    [reset]
  );

  function handleInputChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) handleFile(file);
  }

  function handleSwapPhoto() {
    setPhoto(null);
    setShowPostDownload(false);
    setFallbackUrl(null);
    setError(null);
  }

  async function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setError(null);
    const result = await downloadCanvasAsPng(canvas);
    if (!result.ok) {
      setError("Não foi possível gerar o download. Tente novamente.");
      return;
    }
    if (result.isFallback) {
      setFallbackUrl(result.fallbackUrl);
    } else {
      setShowPostDownload(true);
    }
  }

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-azul">
      <TricolorBar />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
        className="hidden"
        onChange={handleInputChange}
      />

      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col items-center justify-center gap-6 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))] lg:flex-row lg:items-center lg:justify-center lg:gap-16 lg:px-12 lg:py-10">
        <div className="flex w-full shrink-0 justify-center lg:w-0 lg:flex-1 lg:justify-start">
          <Hero />
        </div>

        <div className="flex w-full flex-col items-center gap-4 lg:w-0 lg:flex-1">
          <CanvasCard>
            <Stage
              canvasRef={canvasRef}
              photo={photo}
              zoom={zoom}
              rotation={rotation}
              pan={pan}
              coverScale={coverScale}
              handlers={handlers}
              onFileDropped={handleFile}
              onTapUpload={() => fileInputRef.current?.click()}
            />
          </CanvasCard>

          {isProcessing && <p className="font-grift text-sm text-white/90">Preparando sua foto…</p>}
          {error && <p className="max-w-xs text-center font-grift text-sm text-red-300">{error}</p>}

          {fallbackUrl && (
            <div className="flex max-w-xs flex-col items-center gap-2">
              <a
                href={fallbackUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full rounded-lg bg-azul-claro py-3 text-center font-grift text-sm font-bold text-white"
              >
                Toque aqui para abrir sua foto
              </a>
              <p className="text-center font-grift text-xs text-white/80">
                Na nova aba, pressione e segure a imagem e escolha "Salvar imagem"
              </p>
            </div>
          )}

          {showPostDownload && (
            <p className="max-w-xs text-center font-grift text-sm font-medium text-white">
              Pronto! Compartilhe e marque @renatorocha
            </p>
          )}

          {photo && (
            <Controls
              zoom={zoom}
              onZoomChange={setZoom}
              rotation={rotation}
              onRotationChange={setRotation}
              onReset={reset}
              onDownload={handleDownload}
              onSwapPhoto={handleSwapPhoto}
            />
          )}
        </div>
      </div>
    </div>
  );
}
