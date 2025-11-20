"use client";

import React, { useEffect, useState } from "react";

interface PlusToCheckIconProps {
  active: boolean;
  className?: string;
}

const PlusToCheckIcon: React.FC<PlusToCheckIconProps> = ({ active, className }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (active) {
      setIsAnimating(true);
      // Animation takes ~0.5s (transition), then hold checkmark for 3s, total ~3.5s
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 3500);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
    }
  }, [active]);

  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Plus Icon - Vertical line */}
      <line
        x1="12"
        y1="7"
        x2="12"
        y2="17"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className={`plus-vertical ${isAnimating ? "hide" : ""}`}
      />
      {/* Plus Icon - Horizontal line */}
      <line
        x1="7"
        y1="12"
        x2="17"
        y2="12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className={`plus-horizontal ${isAnimating ? "hide" : ""}`}
      />
      {/* Checkmark */}
      <polyline
        points="6 12 10 16 18 8"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        className={`checkmark ${isAnimating ? "show" : ""}`}
      />
    </svg>
  );
};

export default PlusToCheckIcon;

