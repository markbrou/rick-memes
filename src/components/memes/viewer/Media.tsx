import Image from "next/image";
import type { MemeItem } from "@/data/memes";
import mediaLoader from "@/lib/mediaLoader";

const mediaClass = "h-full w-full object-contain md:h-auto md:max-h-[90vh] md:w-auto md:max-w-full";

export default function Media({ item }: { item: MemeItem }) {
  return (
    <div className="relative flex min-h-0 flex-1 items-center justify-center bg-black md:min-w-0">
      {item.type === "video" && item.videoSrc ? (
        <video
          key={item.id}
          src={item.videoSrc}
          poster={item.thumbnail}
          controls
          autoPlay
          playsInline
          className={mediaClass}
        />
      ) : (
        <>
          <Image
            src={item.thumbnail}
            alt={item.title}
            width={item.width}
            height={item.height}
            loader={mediaLoader}
            unoptimized
            className={mediaClass}
            priority
          />
          {item.type === "video" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="rounded-full bg-black/70 px-5 py-2 text-sm font-semibold text-white">
                Video volgt binnenkort
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
