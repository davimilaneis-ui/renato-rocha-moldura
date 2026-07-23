const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const ACCEPTED_EXTENSIONS = /\.(jpe?g|png|webp|heic|heif)$/i;
const MAX_BYTES = 15 * 1024 * 1024;

export function validateFile(file) {
  const typeOk = ACCEPTED_TYPES.includes(file.type) || ACCEPTED_EXTENSIONS.test(file.name || "");
  if (!typeOk) {
    return { ok: false, error: "Formato não suportado. Use JPG, PNG, WEBP ou HEIC." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "Arquivo muito grande. O limite é 15MB." };
  }
  return { ok: true };
}
