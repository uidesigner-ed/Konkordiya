"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";
import { imageReady } from "@/lib/image";

/**
 * next/image, яке з'являється лише повністю завантаженим і декодованим:
 * без порядкової «прогрузки», як на повільному інтернеті, — одразу ціла картинка з м'яким проявом.
 */
export function Photo({ className = "", alt, ...props }: ImageProps) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    imageReady(ref.current, 8000).then(() => alive && setLoaded(true));
    return () => {
      alive = false;
    };
  }, []);

  return <Image ref={ref} alt={alt} {...props} className={`photo ${className}`} data-loaded={loaded ? "true" : "false"} />;
}
