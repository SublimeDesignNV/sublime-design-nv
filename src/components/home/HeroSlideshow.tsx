"use client";

import { useEffect, useRef, useState } from "react";

interface Slide {
  id: string;
  url: string;
  mediaType: string;
  alt?: string | null;
}

interface HeroSlideshowProps {
  slides: Slide[];
}

const SLIDE_DURATION = 8000;

export default function HeroSlideshow({ slides }: HeroSlideshowProps) {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const goToNext = () => {
    if (slides.length <= 1) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
      setTransitioning(false);
    }, 600);
  };

  useEffect(() => {
    timerRef.current = setTimeout(goToNext, SLIDE_DURATION);
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, slides.length]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [current]);

  const slide = slides[current];

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Media layer */}
      <div
        className="absolute inset-0 transition-opacity duration-[600ms]"
        style={{ opacity: transitioning ? 0 : 1 }}
      >
        {slide.mediaType === "video" ? (
          <video
            ref={videoRef}
            key={slide.id}
            src={slide.url}
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop={slides.length === 1}
            playsInline
            onEnded={slides.length > 1 ? goToNext : undefined}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={slide.id}
            src={slide.url}
            alt={slide.alt ?? "Sublime Design NV"}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      {/* Dot indicators — only show if 2+ slides */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="h-2 w-2 rounded-full transition-all"
              style={{
                backgroundColor: i === current ? "#CC2027" : "rgba(255,255,255,0.5)",
                transform: i === current ? "scale(1.3)" : "scale(1)",
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
