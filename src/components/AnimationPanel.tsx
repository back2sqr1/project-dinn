import React, { useEffect, useState } from 'react';
import AsciiAnimation from '@/components/AsciiAnimation';
import generateFrames from '@/utils/generateFrames';

interface AnimationPanelProps {
  parsedData: any;
  robots: any[];
  selectedRobotMap: Map<string, any> | null;
}

export default function AnimationPanel({ 
  parsedData, 
  robots, 
  selectedRobotMap 
}: AnimationPanelProps) {
  const [frames, setFrames] = useState<string[]>([]);

  useEffect(() => {
    const robotsToUse = selectedRobotMap || robots;
    const newFrames = generateFrames(parsedData, robotsToUse);
    setFrames(newFrames);
  }, [parsedData, robots, selectedRobotMap]);

  return (
    <div className="justify-center items-center flex flex-col">
      <AsciiAnimation
        frames={frames}
        frameRate={2}
      />
    </div>
  );
}
