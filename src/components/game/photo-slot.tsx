"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Intenta mostrar una foto real en `src`. Si el archivo no existe (404) o falla,
 * muestra el `fallback` ilustrado sin romper el layout. Así el juego se ve bien
 * desde el día uno y mejora solo apenas se agregan fotos reales en /public/images.
 */
export function PhotoSlot({
  src,
  alt,
  className,
  imgClassName,
  fallback,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  fallback: React.ReactNode;
}) {
  const [failed, setFailed] = React.useState(false);

  if (failed) {
    return <div className={className}>{fallback}</div>;
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- las fotos son opcionales y variables, sin dimensiones fijas conocidas */}
      <img
        src={src}
        alt={alt}
        onError={() => setFailed(true)}
        className={cn("h-full w-full object-cover", imgClassName)}
      />
    </div>
  );
}
