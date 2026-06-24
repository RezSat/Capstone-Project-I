import { ImageLoaderProps } from "next/image";

export default function imageLoader({ src, width, quality }: ImageLoaderProps): string {
  const params = new URLSearchParams();
  if (width) params.set("w", width.toString());
  if (quality) params.set("q", quality.toString());
  const queryString = params.toString();

  if (src.startsWith("http")) {
    return queryString ? `${src}?${queryString}` : src;
  }

  return queryString ? `${src}?${queryString}` : src;
}
