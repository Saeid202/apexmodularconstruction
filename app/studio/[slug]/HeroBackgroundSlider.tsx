"use client";

import { useEffect, useState } from "react";

interface HeroBackgroundSliderProps {
  images: string[];
  intervalMs?: number;
  overlayOpacity?: number;
}

export default function HeroBackgroundSlider({
  images,
  intervalMs = 6000,
  overlayOpacity = 0.4,
}: HeroBackgroundSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [images, intervalMs]);

  if (!images || images.length === 0) return null;

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
      {/* Dark tint overlay */}
      <div 
        className="absolute inset-0 bg-slate-950 z-10 transition-opacity duration-500" 
        style={{ opacity: overlayOpacity }}
      />
      
      {/* Slides */}
      {images.map((image, index) => (
        <div
          key={image}
          className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out"
          style={{
            backgroundImage: `url(${image})`,
            opacity: index === currentIndex ? 1 : 0,
            zIndex: index === currentIndex ? 1 : 0,
          }}
        />
      ))}
    </div>
  );
}
