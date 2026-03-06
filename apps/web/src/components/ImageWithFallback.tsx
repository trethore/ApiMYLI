"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";

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

  return (
    <Image
      src={src}
      alt={alt}
      onError={() => {
        setError(true);
      }}
      {...rest}
    />
  );
}
