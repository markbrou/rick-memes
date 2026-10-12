type MediaDetails = {
  width: number;
  height: number;
  thumbnail?: Blob;
};

type UploadResponse = {
  key: string;
  publicUrl: string;
};

export async function inspectMedia(file: File): Promise<MediaDetails> {
  if (file.type.startsWith("image/")) {
    const image = await createImageBitmap(file);
    const dimensions = { width: image.width, height: image.height };
    image.close();
    return dimensions;
  }

  const source = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "metadata";
  video.src = source;

  try {
    await once(video, "loadedmetadata");
    video.currentTime = Math.min(0.1, Math.max(0, video.duration / 2));
    await once(video, "seeked");

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);

    const thumbnail = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Videominiatuur maken is niet gelukt"))), "image/jpeg", 0.85);
    });

    return { width: video.videoWidth, height: video.videoHeight, thumbnail };
  } finally {
    URL.revokeObjectURL(source);
  }
}

export async function uploadMedia(file: Blob, fileName: string): Promise<UploadResponse> {
  const body = new FormData();
  body.append("file", file, fileName);

  const response = await fetch("/api/media", {
    method: "POST",
    body,
  });
  if (!response.ok) throw new Error("Media uploaden is niet gelukt");

  return (await response.json()) as UploadResponse;
}

function once(target: HTMLMediaElement, event: string) {
  return new Promise<void>((resolve, reject) => {
    target.addEventListener(event, () => resolve(), { once: true });
    target.addEventListener("error", () => reject(new Error("De gekozen video kan niet worden gelezen")), { once: true });
  });
}
