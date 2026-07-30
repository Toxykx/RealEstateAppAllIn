"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type GalleryImage = { id: string; url: string; isCover?: boolean };

export function PropertyGallery({
  images,
  alt,
  renderOverlay,
}: {
  images: GalleryImage[];
  alt: string;
  renderOverlay?: (image: GalleryImage, index: number) => React.ReactNode;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const close = useCallback(() => {
    setOpenIndex(null);
    setZoomed(false);
  }, []);

  const step = useCallback(
    (direction: -1 | 1) => {
      setOpenIndex((current) => {
        if (current === null || images.length === 0) return current;
        return (current + direction + images.length) % images.length;
      });
      setZoomed(false);
    },
    [images.length],
  );

  useEffect(() => {
    if (openIndex === null) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openIndex, step]);

  if (images.length === 0) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-lg bg-muted text-muted-foreground">
        אין תמונות עדיין
      </div>
    );
  }

  const current = openIndex !== null ? images[openIndex] : null;

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {images.map((image, i) => (
          <div
            key={image.id}
            role="button"
            tabIndex={0}
            aria-label={`פתיחת תמונה ${i + 1} מתוך ${images.length} בתצוגה מלאה`}
            onClick={() => setOpenIndex(i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setOpenIndex(i);
              }
            }}
            className={cn(
              "group relative cursor-pointer overflow-hidden rounded-lg bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              i === 0 ? "col-span-2 aspect-video sm:col-span-4" : "aspect-square",
            )}
          >
            <Image
              src={image.url}
              alt={alt}
              fill
              loading={i === 0 ? "eager" : "lazy"}
              sizes="(max-width: 640px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {image.isCover && <Badge className="absolute start-1 top-1">תמונת נושא</Badge>}
            {renderOverlay?.(image, i)}
          </div>
        ))}
      </div>

      <DialogPrimitive.Root open={openIndex !== null} onOpenChange={(open) => !open && close()}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/95 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
          <DialogPrimitive.Popup className="fixed inset-0 z-50 flex flex-col outline-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0">
            {current && (
              <>
                <div className="flex items-center justify-between p-3 text-white sm:p-4">
                  <span className="text-sm text-white/70">
                    {openIndex! + 1} / {images.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setZoomed((z) => !z)}
                      aria-label={zoomed ? "התרחקות" : "הגדלה"}
                      className="flex size-11 items-center justify-center rounded-full text-white/80 outline-none hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      {zoomed ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
                    </button>
                    <DialogPrimitive.Close
                      aria-label="סגירה"
                      className="flex size-11 items-center justify-center rounded-full text-white/80 outline-none hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <X className="h-5 w-5" />
                    </DialogPrimitive.Close>
                  </div>
                </div>

                <div
                  className="relative flex-1 select-none overflow-auto"
                  onTouchStart={(e) => {
                    touchStartX.current = e.touches[0].clientX;
                  }}
                  onTouchEnd={(e) => {
                    if (touchStartX.current === null) return;
                    const delta = e.changedTouches[0].clientX - touchStartX.current;
                    if (Math.abs(delta) > 50) step(delta > 0 ? -1 : 1);
                    touchStartX.current = null;
                  }}
                >
                  <div
                    onClick={() => setZoomed((z) => !z)}
                    className={cn(
                      "relative mx-auto h-full min-h-full w-full cursor-zoom-in transition-transform duration-200",
                      zoomed && "scale-150 cursor-zoom-out",
                    )}
                  >
                    <Image src={current.url} alt={alt} fill sizes="100vw" className="object-contain" priority />
                  </div>
                </div>

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => step(-1)}
                      aria-label="התמונה הקודמת"
                      className="absolute inset-y-0 left-1 flex items-center rounded-full p-2 text-white/80 outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-primary sm:left-3"
                    >
                      <ChevronLeft className="h-8 w-8" />
                    </button>
                    <button
                      type="button"
                      onClick={() => step(1)}
                      aria-label="התמונה הבאה"
                      className="absolute inset-y-0 right-1 flex items-center rounded-full p-2 text-white/80 outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-primary sm:right-3"
                    >
                      <ChevronRight className="h-8 w-8" />
                    </button>
                  </>
                )}

                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto p-3 [overscroll-behavior-x:contain] sm:p-4">
                    {images.map((image, i) => (
                      <button
                        key={image.id}
                        type="button"
                        onClick={() => {
                          setOpenIndex(i);
                          setZoomed(false);
                        }}
                        aria-label={`תמונה ${i + 1} מתוך ${images.length}`}
                        aria-current={i === openIndex}
                        className={cn(
                          "relative h-14 w-14 shrink-0 overflow-hidden rounded-md outline-none ring-2 ring-transparent transition focus-visible:ring-primary",
                          i === openIndex && "ring-primary",
                        )}
                      >
                        <Image src={image.url} alt="" fill loading="lazy" className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
