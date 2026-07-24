function canvasToBlob(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

function triggerAnchorDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

// All iOS browsers (Safari, Chrome, Firefox, ...) run on Apple's WebKit engine,
// so the download-attribute/blob quirks are not Safari-specific — any browser
// on iOS can hit them.
function isIosDevice() {
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);
}

async function tryShare(blob, filename) {
  if (!navigator.canShare || !navigator.share) return false;
  try {
    const file = new File([blob], filename, { type: "image/png" });
    if (!navigator.canShare({ files: [file] })) return false;
    await navigator.share({ files: [file] });
    return true;
  } catch (err) {
    if (err?.name === "AbortError") throw err;
    return false;
  }
}

// iOS: canvas.toBlob + the `download` attribute is unreliable across every
// WebKit-based browser. The Web Share API opens the native "Save Image" sheet
// instead, which is far more familiar/reliable for users on iPhone. When
// share isn't available we fall back to opening the image in a new tab so
// the user can long-press to save it.
export async function downloadCanvasAsPng(canvas, filename = "moldura-renato-rocha.png") {
  const blob = await canvasToBlob(canvas);

  if (!blob) {
    return { ok: false, fallbackUrl: canvas.toDataURL("image/png") };
  }

  if (isIosDevice()) {
    try {
      const shared = await tryShare(blob, filename);
      if (shared) return { ok: true };
    } catch (err) {
      if (err?.name === "AbortError") {
        return { ok: false, cancelled: true };
      }
    }

    const url = URL.createObjectURL(blob);
    return { ok: true, fallbackUrl: url, isFallback: true };
  }

  try {
    triggerAnchorDownload(blob, filename);
    return { ok: true };
  } catch {
    const url = URL.createObjectURL(blob);
    return { ok: true, fallbackUrl: url, isFallback: true };
  }
}
