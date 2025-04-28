import React, { useEffect, useMemo, useState } from "react";
import { calculatePhotoIndex } from "../utils/helpers";

export default function PhotoCarousel() {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const photos = useMemo(
    () => [
      "/real-mango-1.jpg",
      "/real-mango-2.jpg",
      "/real-mango-3.JPG",
      "/real-mango-4.jpg",
    ],
    []
  );

  const photosWithDuplicates = useMemo(
    () => [photos[photos.length - 1], ...photos, photos[0]],
    [photos]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhotoIndex((prevIndex) =>
        calculatePhotoIndex(prevIndex, photos.length)
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [photos.length]);

  return (
    <div
      className="photo-carousel"
      style={{
        display: "flex",
        overflow: "hidden",
        width: "100%",
        maxWidth: "900px",
        margin: "20px auto 0",
      }}
    >
      <div
        className="carousel-track"
        style={{
          display: "flex",
          transition: "transform 0.5s ease-in-out",
          transform: `translateX(-${
            (currentPhotoIndex % photosWithDuplicates.length) * 33.33
          }%)`,
        }}
      >
        {photosWithDuplicates.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`Mango photo ${index + 1}`}
            style={{
              width: "33.33%",
              flexShrink: 0,
              height: "auto",
              borderRadius: "10px",
              margin: "0 10px",
              border: "1px solid #ccc",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
