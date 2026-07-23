import { useEffect, useState } from "react";
import maskUrl from "../assets/mascara.png";

let cached = null;

export function useMaskImage() {
  const [mask, setMask] = useState(cached);

  useEffect(() => {
    if (cached) {
      setMask(cached);
      return;
    }
    const img = new Image();
    img.src = maskUrl;
    img.decode().then(() => {
      cached = img;
      setMask(img);
    });
  }, []);

  return mask;
}
