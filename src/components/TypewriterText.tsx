import React from 'react';
import { Typewriter } from 'nextjs-simple-typewriter';

interface TypewriterTextProps {
  text: string | string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  delaySpeed?: number;
  loop?: number;
  cursor?: boolean;
  cursorStyle?: string;
}

export default function TypewriterText({ 
  text,
  typeSpeed = 30,
  deleteSpeed = 50,
  delaySpeed = 1000,
  loop = 1,
  cursor = true,
  cursorStyle = ''
}: TypewriterTextProps) {
  const words = Array.isArray(text) ? text : [text];

  return (
    <Typewriter
      words={words}
      loop={loop}
      cursor={cursor}
      cursorStyle={cursorStyle}
      typeSpeed={typeSpeed}
      deleteSpeed={deleteSpeed}
      delaySpeed={delaySpeed}
    />
  );
}
