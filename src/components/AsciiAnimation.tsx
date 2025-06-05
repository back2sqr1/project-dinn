'use client';
import React, { useState, useEffect } from 'react';

type AsciiAnimationProps = {
  frames: string[];
  frameRate?: number; // frames per second
  fontSize?: string; // e.g., '16px'
  style?: React.CSSProperties;
};

export default function AsciiAnimation({
  frames,
  frameRate = 5,
  fontSize = 'clamp(18px, 3vw, 30px)',
  style = {},
}: AsciiAnimationProps) {
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frames.length);
    }, 1000 / frameRate);

    return () => clearInterval(interval);
  }, [frames.length, frameRate]);

  return (
    <pre
      style={{
        fontFamily: 'VT323',
        whiteSpace: 'pre',
        overflow: 'hidden',
        fontSize,
        lineHeight: 1.2,
        margin: 0,
        color: 'lime',
        ...style,
      }}
    >
      {frames[currentFrame]}
    </pre>
  );
}
