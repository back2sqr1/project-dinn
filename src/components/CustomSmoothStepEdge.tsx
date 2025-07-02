import React from 'react';
import { BaseEdge, EdgeProps } from '@xyflow/react';

export default function CustomSmoothStepEdge(props: EdgeProps) {
  const {
    sourceX,
    sourceY,
    targetX,
    targetY,
    style = {},
    markerEnd,
    animated
  } = props;

  // Extract button index from multiple possible sources
  
  // Try to get from sourceHandle property (if available)
  const buttonIndex = (props as any).data.buttonIndex;
  const buttonCount = (props as any).data.buttonCount || 0;
  
  // Circuit-style routing: each edge takes a different horizontal route
  const baseRouteDistance = (targetX - sourceX) / 2; // Base distance before turning
  const routeSpacing = 5; // Space between routing lanes
  const routeOffset = buttonIndex * routeSpacing;  

  const maxLengthDistance = sourceX + baseRouteDistance + buttonCount * routeSpacing;


  // Calculate intermediate points for circuit-style routing
  const midX = maxLengthDistance - routeOffset;
  
  // Create a custom path that goes: right → down/up → right (like circuit traces)
  const pathData = [
    `M ${sourceX} ${sourceY}`, // Start at source
    `L ${midX} ${sourceY}`,    // Go right to routing channel
    `L ${midX} ${targetY}`,    // Go down/up to target level
    `L ${targetX} ${targetY}`  // Go right to target
  ].join(' ');

  return (
    <>
      <BaseEdge
        path={pathData}
        markerEnd={markerEnd}
        style={{
          ...(style || {}),
          strokeWidth: 1,
          strokeDasharray: animated ? '5,5' : undefined,
          fill: 'none',
        }}
        className={animated ? 'animated-edge' : ''}
      />
      <style jsx>{`
        .animated-edge {
          animation: dash 1s linear infinite;
        }
        @keyframes dash {
          to {
            stroke-dashoffset: -10;
          }
        }
      `}</style>
    </>
  );
}
