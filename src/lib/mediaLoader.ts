import type { ImageLoaderProps } from "next/image";

export default function mediaLoader({ src }: ImageLoaderProps) {
  return src;
}