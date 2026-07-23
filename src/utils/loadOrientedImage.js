import { orientation as readOrientation } from "exifr";

const HEIC_TYPES = ["image/heic", "image/heif"];

function isHeic(file) {
  if (HEIC_TYPES.includes(file.type)) return true;
  return /\.(heic|heif)$/i.test(file.name || "");
}

async function toDecodableBlob(file) {
  if (!isHeic(file)) return file;
  const heic2any = (await import("heic2any")).default;
  const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
  return Array.isArray(converted) ? converted[0] : converted;
}

async function decodeUpright(blob) {
  // imageOrientation: "none" prevents the browser from auto-applying EXIF
  // rotation, so we can apply it ourselves exactly once, consistently
  // across browsers.
  let bitmap;
  try {
    bitmap = await createImageBitmap(blob, { imageOrientation: "none" });
  } catch {
    bitmap = await createImageBitmap(blob);
  }
  return bitmap;
}

export async function loadOrientedImage(file) {
  const decodable = await toDecodableBlob(file);

  let orientation = 1;
  try {
    orientation = (await readOrientation(file)) || 1;
  } catch {
    orientation = 1;
  }

  const rawBitmap = await decodeUpright(decodable);

  if (orientation === 1 || !orientation) {
    return { bitmap: rawBitmap, width: rawBitmap.width, height: rawBitmap.height };
  }

  const { width, height } = rawBitmap;
  const swapDims = orientation > 4;
  const outW = swapDims ? height : width;
  const outH = swapDims ? width : height;

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");

  // Standard EXIF-orientation-to-canvas-transform matrices.
  switch (orientation) {
    case 2:
      ctx.transform(-1, 0, 0, 1, width, 0);
      break;
    case 3:
      ctx.transform(-1, 0, 0, -1, width, height);
      break;
    case 4:
      ctx.transform(1, 0, 0, -1, 0, height);
      break;
    case 5:
      ctx.transform(0, 1, 1, 0, 0, 0);
      break;
    case 6:
      ctx.transform(0, 1, -1, 0, height, 0);
      break;
    case 7:
      ctx.transform(0, -1, -1, 0, height, width);
      break;
    case 8:
      ctx.transform(0, -1, 1, 0, 0, width);
      break;
    default:
      break;
  }

  ctx.drawImage(rawBitmap, 0, 0);
  rawBitmap.close?.();

  const bitmap = await createImageBitmap(canvas);
  return { bitmap, width: outW, height: outH };
}
