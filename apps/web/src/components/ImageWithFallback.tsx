"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";

const FMA_BASE = "https://files.freemusicarchive.org/storage-freemusicarchive-org/";

/**
 * Normalise une URL d'image FMA selon la même logique que script_fix_links.py :
 *  - Si l'URL commence déjà par FMA_BASE → déjà correcte, on la laisse
 *  - Sinon → strip les 34 premiers chars (ex: "https://freemusicarchive.org/file/"
 *    fait exactement 34 chars) puis préfixe avec FMA_BASE
 */
function normalizeImageUrl(url: string): string {
  if (url.startsWith(FMA_BASE)) return url;
  // Mirrors Python: url.str[34:] then prepend FMA_BASE
  const stripped = url.length > 34 ? url.slice(34) : url;
  return `${FMA_BASE}${stripped}`;
}

interface ImageWithFallbackProps extends ImageProps {
  fallbackSrc?: string;
}

export default function ImageWithFallback({
  src,
  fallbackSrc = "/placeholder-music.jpg",
  alt,
  ...rest
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  const isPlaceholder = !src || (typeof src === "string" && src.includes("placeholder"));

  if (error || isPlaceholder) {
    // Return a gradient div matching the app's aesthetic
    return (
      <div 
        className={`w-full h-full bg-gradient-to-br from-[var(--color-muse-sky-blue)] to-[var(--color-muse-pink)] opacity-80 ${rest.fill ? "absolute inset-0" : ""} ${rest.className || ""}`}
      />
    );
  }

  // Normalise l'URL si c'est une chaîne brute (chemin relatif FMA)
  const resolvedSrc = typeof src === "string" ? normalizeImageUrl(src) : src;

  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      sizes={rest.fill && !rest.sizes ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" : rest.sizes}
      onError={() => {
        setError(true);
      }}
      {...rest}
    />
  );
}
