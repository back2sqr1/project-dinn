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
  fontSize = 'clamp(8px, 2vw, 16px)',
  style = {},
}: AsciiAnimationProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [calculatedFontSize, setCalculatedFontSize] = useState(fontSize);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frames.length);
    }, 1000 / frameRate);

    return () => clearInterval(interval);
  }, [frames.length, frameRate]);

  useEffect(() => {
    const calculateFontSize = () => {
      if (frames.length === 0) return;
      
      const frame = frames[0];
      const lines = frame.split('\n');
      const maxWidth = Math.max(...lines.map(line => line.length));
      const height = lines.length;
      
      const targetHeight = window.innerHeight / 3;
      const targetWidth = window.innerWidth;
      
      // Calculate font size based on height constraint
      const fontSizeByHeight = targetHeight / (height * 1.2); // 1.2 is line height
      
      // Calculate font size based on width constraint (approximate character width is 0.6 of font size)
      const fontSizeByWidth = targetWidth / (maxWidth * 0.6);
      
      // Use the smaller value to ensure it fits both constraints
      const finalFontSize = Math.min(fontSizeByHeight, fontSizeByWidth);
      
      setCalculatedFontSize(`${Math.max(8, finalFontSize)}px`);
    };

    calculateFontSize();
    window.addEventListener('resize', calculateFontSize);
    
    return () => window.removeEventListener('resize', calculateFontSize);
  }, [frames]);

  return (
    <pre
      style={{
        fontFamily: 'VT323',
        whiteSpace: 'pre',
        overflow: 'hidden',
        fontSize: calculatedFontSize,
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
