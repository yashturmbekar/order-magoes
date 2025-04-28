import React, { useEffect } from "react";

export default function FallingMangoes({ showAnimation }) {
  useEffect(() => {
    const timer = setTimeout(() => setShowAnimation(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!showAnimation) return null;

  return (
    <div className="falling-mangoes">
      {Array.from({ length: 50 }).map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 4;
        const duration = 4 + Math.random() * 3;
        const size = 25 + Math.random() * 20;
        return (
          <img
            key={i}
            src="/src/assets/images/mango-icon.png"
            className="mango"
            style={{
              left: `${left}%`,
              width: `${size}px`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              animationFillMode: "forwards",
              position: "absolute",
            }}
          />
        );
      })}
    </div>
  );
}
