"use client";

import { useCallback, useState } from "react";
import { Upload } from "lucide-react";

type DropzoneProps = {
  onFilesSelected: (files: File[]) => void;
  accept?: string[];
  maxSizeMB?: number;
};

const DEFAULT_ACCEPT = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function ImageDropzone({ onFilesSelected, accept = DEFAULT_ACCEPT, maxSizeMB = 10 }: DropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filterFiles = useCallback(
    (fileList: FileList | File[]): File[] => {
      const valid: File[] = [];
      for (const file of Array.from(fileList)) {
        if (!accept.includes(file.type)) {
          setError(`Invalid type: ${file.name}. Use JPEG, PNG, WEBP, or GIF.`);
          return [];
        }
        if (file.size > maxSizeMB * 1024 * 1024) {
          setError(`${file.name} exceeds ${maxSizeMB}MB.`);
          return [];
        }
        valid.push(file);
      }
      setError(null);
      return valid;
    },
    [accept, maxSizeMB]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const files = filterFiles(e.dataTransfer.files);
      if (files.length) onFilesSelected(files);
    },
    [filterFiles, onFilesSelected]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files?.length) return;
      const files = filterFiles(e.target.files);
      if (files.length) onFilesSelected(files);
      e.target.value = "";
    },
    [filterFiles, onFilesSelected]
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => document.getElementById("dropzone-input")?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") document.getElementById("dropzone-input")?.click(); }}
      className={`flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-6 transition-colors cursor-pointer ${
        dragging ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-muted-foreground/50"
      }`}
    >
      <input id="dropzone-input" type="file" accept={accept.join(",")} multiple className="hidden" onChange={handleChange} />
      <Upload className="size-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground text-center">
        Drag and drop images here, or <span className="text-primary font-medium">click to browse</span>
      </p>
      <p className="text-xs text-muted-foreground">JPEG, PNG, WEBP, GIF up to {maxSizeMB}MB</p>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}