"use client";

import { type ChangeEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadDashboardProductImage } from "@/modules/product-files/dashboard-product-image-upload.service";

type UploadProductImageFormProps = {
  productId: string;
  onUploaded?: () => void;
};

const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp,image/gif";

/** Minimal image upload form. Selects a file, then runs the upload → finalize flow. */
export function UploadProductImageForm({ productId, onUploaded }: UploadProductImageFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const lockRef = useRef(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [makePublic, setMakePublic] = useState(false);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    setFileName(file ? file.name : "");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lockRef.current) return;

    const file = inputRef.current?.files?.[0];
    if (!file) return;

    lockRef.current = true;
    setIsUploading(true);

    const result = await uploadDashboardProductImage({ productId, file }, { makePublic });

    if (result.isSuccess) {
      toast.success(result.message);
      setFileName("");
      if (inputRef.current) inputRef.current.value = "";
      onUploaded?.();
    } else {
      toast.error(result.message);
    }

    lockRef.current = false;
    setIsUploading(false);
  }

  return (
    <form
      aria-busy={isUploading}
      className="grid gap-3 rounded-md border border-border bg-card p-4"
      onSubmit={handleSubmit}
    >
      <h2 className="text-sm font-semibold">Upload Product Image</h2>
      <input
          ref={inputRef}
          accept={ACCEPTED_TYPES}
          className="hidden"
          disabled={isUploading}
          id="product-image-file"
          name="file"
          type="file"
          onChange={handleFileChange}
        />
      <label
        className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
        htmlFor="product-image-file"
      >
        {fileName ? fileName : "Choose Image"}
      </label>
      {fileName ? <p className="text-xs text-muted-foreground">Selected: {fileName}</p> : null}
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          checked={makePublic}
          disabled={isUploading}
          onChange={(e) => setMakePublic(e.target.checked)}
          type="checkbox"
        />
        Make public (visible without login)
      </label>
      <Button className="w-fit" disabled={isUploading || !fileName} type="submit">
        {isUploading ? "Uploading..." : "Upload Image"}
      </Button>
    </form>
  );
}
