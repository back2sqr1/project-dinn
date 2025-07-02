'use client';
import { Typewriter } from 'nextjs-simple-typewriter'
import Link from "next/link";
import React, { useState, useCallback } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import '@/styles/override_xy.css';

import { useLocalStorageData, useSearchTree } from '@/hooks/useSimulationData';
import { useReactFlowTree } from '@/hooks/useReactFlowTree';
import FlowViewer from '@/components/FlowViewer';
import AnimationPanel from '@/components/AnimationPanel';

export default function Home() {
  const [allowWaiting, setAllowWaiting] = useState<boolean>(true);
  
  // Load data from localStorage
  const { parsedData, robots } = useLocalStorageData();
  
  // Handle tree selection state
  const { selectedRobotMap, handleNodeSelect, clearSelection } = useSearchTree();

  // Handle ReactFlow tree state
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    highlightMode,
    handleHighlightModeChange,
    handleReorganizeLayout,
    handleClearTree
  } = useReactFlowTree({
    parsedData,
    robots,
    allowWaiting,
    onNodeSelect: handleNodeSelect,
    clearSelection
  });

  const handleAllowWaitingChange = useCallback((newAllowWaiting: boolean) => {
    setAllowWaiting(newAllowWaiting);
    // Clear the tree since we need to regenerate with new waiting settings
    handleClearTree();
  }, [handleClearTree]);

  return (
    <div className="retro-container relative">
      <span className="absolute left-1 bottom-0">
        <Link href="/belief-graph">prev</Link>
      </span>

      <header className="mb-4">
        <h1>
          <Typewriter
            words={['Search']}
            loop={1}
            cursor
            cursorStyle=''
            typeSpeed={30}
            deleteSpeed={50}
            delaySpeed={1000}
          />
        </h1>
        <hr/>
      </header>
      
      <div className="flex gap-2 h-full">
        <AnimationPanel 
          parsedData={parsedData}
          robots={robots}
          selectedRobotMap={selectedRobotMap}
        />
        
        <div className="flex-1">
          <ReactFlowProvider>
            <FlowViewer
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              highlightMode={highlightMode}
              onHighlightModeChange={handleHighlightModeChange}
              onReorganizeLayout={handleReorganizeLayout}
              onClearTree={handleClearTree}
              allowWaiting={allowWaiting}
              onAllowWaitingChange={handleAllowWaitingChange}
            />
          </ReactFlowProvider>
        </div>
      </div>

      <span className="absolute right-1 bottom-0">
        <Link href="/references">next</Link>
      </span>
    </div>
  );
}

