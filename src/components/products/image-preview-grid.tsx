"use client";

import { useMemo } from "react";
import Image from "next/image";
import { X } from "lucide-react";

export type ImagePreviewEntry = {
  id: string;
  file?: File;
  src: string;
  alt: string;
  orientation: "portrait" | "landscape" | "square";
};

type Props = {
  images: ImagePreviewEntry[];
  onChange: (images: ImagePreviewEntry[]) => void;
};

export function ImagePreviewGrid({ images, onChange }: Props) {
  const previews = useMemo(() => {
    const map: Record<string, string> = {};
    for (const img of images) {
      if (img.file) {
        map[img.id] = URL.createObjectURL(img.file);
      } else if (img.src.startsWith("http") || img.src.startsWith("/")) {
        map[img.id] = img.src;
      }
    }
    return map;
  }, [images]);

  function removeImage(id: string) {
    onChange(images.filter((img) => img.id !== id));
  }

  function updateOrientation(id: string, orientation: "portrait" | "landscape" | "square") {
    onChange(images.map((img) => (img.id === id ? { ...img, orientation } : img)));
  }

  if (images.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-3 mt-3">
      {images.map((img) => (
        <div key={img.id} className="relative rounded-md border border-border bg-card overflow-hidden">
          <div className="relative aspect-square overflow-hidden bg-muted">
            {previews[img.id] ? (
              <Image src={previews[img.id]} alt={img.alt || "preview"} fill sizes="(max-width: 768px) 33vw, 15vw" className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Loading...</div>
            )}
          </div>
          <button type="button" onClick={() => removeImage(img.id)} className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80">
            <X className="size-3" />
          </button>
          <div className="p-1.5">
            <select
              className="w-full h-7 rounded-md border border-input bg-transparent px-1 text-xs text-center"
              value={img.orientation}
              onChange={(e) => updateOrientation(img.id, e.target.value as "portrait" | "landscape" | "square")}
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
              <option value="square">Square</option>
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}