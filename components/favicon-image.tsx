"use client";

import { useState } from "react";
import Image from "next/image";
import { getFaviconUrl, getFallbackIcon } from "@/lib/favicon-utils";

interface FaviconImageProps {
  url: string;
  category: string;
  name: string;
  size?: number;
}

export default function FaviconImage({
  url,
  category,
  name,
  size = 24,
}: FaviconImageProps) {
  const [error, setError] = useState(false);
  const faviconUrl = getFaviconUrl(url);

  if (!faviconUrl || error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-sm">{getFallbackIcon(category)}</span>
      </div>
    );
  }

  return (
    <Image
      src={faviconUrl}
      alt={`${name} favicon`}
      width={size}
      height={size}
      className="w-full h-full object-contain"
      onError={() => setError(true)}
      unoptimized // This helps with dynamic favicon URLs
    />
  );
}
