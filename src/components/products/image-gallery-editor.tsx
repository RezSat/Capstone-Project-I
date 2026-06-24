"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { ImageDropzone } from "./image-dropzone";
import { ImagePreviewGrid, type ImagePreviewEntry } from "./image-preview-grid";

type ProductImageEntry = {
  id: string;
  src: string;
  alt: string;
  orientation: "portrait" | "landscape" | "square";
  file?: File;
};

type ImageGalleryEditorProps = {
  images: ProductImageEntry[];
  onChange: (images: ProductImageEntry[]) => void;
  onPendingFilesChange?: (files: File[]) => void;
};

export function ImageGalleryEditor({ images, onChange, onPendingFilesChange }: ImageGalleryEditorProps) {
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  function addPending(files: File[]) {
    const newEntries: ImagePreviewEntry[] = files.map((file) => ({
      id: `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      src: "",
      alt: "",
      orientation: "square" as const,
    }));
    onChange([...images, ...newEntries]);
    const nextPending = [...pendingFiles, ...files];
    setPendingFiles(nextPending);
    onPendingFilesChange?.(nextPending);
  }

  function removeImage(id: string) {
    const removed = images.find((img) => img.id === id);
    onChange(images.filter((img) => img.id !== id));
    if (removed?.file) {
      const updated = pendingFiles.filter((f) => f !== removed.file);
      setPendingFiles(updated);
      onPendingFilesChange?.(updated);
    }
  }

  function updateOrientation(id: string, orientation: "portrait" | "landscape" | "square") {
    onChange(images.map((img) => (img.id === id ? { ...img, orientation } : img)));
  }

  const hasPending = images.some((img) => !img.src);
  const savedImages = images.filter((img) => img.src);

  return (
    <section className="rounded-md border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-oswald text-lg font-semibold uppercase tracking-wide">Product Images</h2>
      </div>
      <ImageDropzone onFilesSelected={addPending} />
      {hasPending && (
        <ImagePreviewGrid
          images={images.filter((img) => !img.src)}
          onChange={(updated) => {
            const remaining = images.filter((img) => img.src);
            onChange([...remaining, ...updated]);
          }}
        />
      )}
      {savedImages.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Saved Images</p>
          <div className="grid grid-cols-3 gap-3">
            {savedImages.map((img) => (
              <div key={img.id} className="relative rounded-md border border-border bg-card overflow-hidden">
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <Image src={img.src} alt={img.alt || "product image"} fill sizes="15vw" className="object-cover" />
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
        </div>
      )}
    </section>
  );
}