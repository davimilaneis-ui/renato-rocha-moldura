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

// iOS Safari frequently ignores the `download` attribute and/or fails
// silently on toBlob for large canvases. When that happens we fall back to
// opening the image in a new tab so the user can long-press to save it.
export async function downloadCanvasAsPng(canvas, filename = "moldura-renato-rocha.png") {
  const blob = await canvasToBlob(canvas);

  if (!blob) {
    return { ok: false, fallbackUrl: canvas.toDataURL("image/png") };
  }

  const ua = navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);

  if (isIos && isSafari) {
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
