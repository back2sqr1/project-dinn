'use client';
import { Typewriter } from 'nextjs-simple-typewriter'
import Link from "next/link";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import search from '@/utils/search';
import { TimeStepNode } from '@/utils/TimeStepNode';
import { createRobotMap } from '@/utils/RobotManager';
import { reorganizeTreeLayout, LayoutNode } from '@/utils/layout';


import { nanoid } from 'nanoid';
import '@xyflow/react/dist/style.css';
import '@/styles/override_xy.css';
import XYTimeStepNode from '@/components/XYTimeStepNode';
import CustomSmoothStepEdge from '@/components/CustomSmoothStepEdge';
import Legend, { HighlightMode } from '@/components/Legend';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  useReactFlow,
} from '@xyflow/react';

import AsciiAnimation from '@/components/AsciiAnimation';
import generateFrames from '@/utils/generateFrames';
import { determine_cost, determine_min_time, getColor, highlightCost, highlightTime} from '@/utils/cost_and_time';

// Wrapper component to access ReactFlow instance
function ReactFlowWrapper({ 
  children, 
  onReorganizeLayout 
}: { 
  children: React.ReactNode; 
  onReorganizeLayout: (reactFlowInstance: any) => void;
}) {
  const reactFlowInstance = useReactFlow();
  
  React.useEffect(() => {
    // Pass the ReactFlow instance to parent when it's available
    if (reactFlowInstance) {
      onReorganizeLayout(reactFlowInstance);
    }
  }, [reactFlowInstance, onReorganizeLayout]);
  
  return <>{children}</>;
}



export default function Home() {
  /*
  Parsed Data - Contains Node set, Names, Edges, and Everything
  Graph - Contains the graph representation of the belief diagram
  Robots - Contains the robot parameters, such as location and velocity
  */
  const [parsedData, setParsedData] = useState<any>(null);
  const [robots, setRobots] = useState<any[]>([]);
  const [selectedRobotMap, setSelectedRobotMap] = useState<Map<string, any> | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [frames, setFrames] = useState<string[]>([]);
  const [highlightMode, setHighlightMode] = useState<HighlightMode>('none');
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);


  const nodeTypes = useMemo(() => ({ xyTimeStepNode: XYTimeStepNode }), []);
  const edgeTypes = useMemo(() => ({ customSmoothStep: CustomSmoothStepEdge }), []);

  const handleNodeSelect = useCallback((robotMap: Map<string, any>) => {
    setSelectedRobotMap(robotMap);
  }, []);

  const handleHighlightModeChange = useCallback((mode: HighlightMode) => {
    setHighlightMode(mode);
    // Update edges with new highlight mode
    
  }, []);

  const handleReactFlowInstance = useCallback((instance: any) => {
    setReactFlowInstance(instance);
  }, []);

  const handleReorganizeLayout = useCallback(() => {
    const currentNodes = nodes as LayoutNode[];
    const reorganizedNodes = reorganizeTreeLayout(currentNodes, edges);
    setNodes(reorganizedNodes as Node[]);
  }, [nodes, edges, setNodes, reactFlowInstance]);

  const handleClearTree = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedRobotMap(null);
  }, [setNodes, setEdges]);

  // Update all nodes and edges when highlight mode changes
  useEffect(() => {
    if (nodes.length > 0) {
      const updatedNodes = nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          highlightMode: highlightMode
        }
      }));
      setNodes(updatedNodes);
    }
    if (edges.length > 0) {
      const updatedEdges = edges.map(edge => ({
        ...edge,
        style: { stroke: edge.data?.highlightColor && Array.isArray(edge.data.highlightColor) ? getColor(edge.data.highlightColor, highlightMode) : edge.style?.stroke }
      }));
      setEdges(updatedEdges);
    }
  }, [highlightMode]); // Removed setNodes dependency to avoid infinite loop


  useEffect(() => {
    const robotsToUse = selectedRobotMap || robots;
    const newFrames = generateFrames(parsedData, robotsToUse);
    setFrames(newFrames);
  }, [parsedData, robots, selectedRobotMap]);

  // search returns a TimeStepNode or null
  const searchResults = useMemo((): TimeStepNode | null =>
    search(parsedData, createRobotMap(robots)),
    [parsedData, robots]
  );

  useEffect(() => {
    if (searchResults && nodes.length === 0) {
      // Only create new nodes if no nodes exist (initial load)
      const newNodes = [{
        id: searchResults.id,
        type: 'xyTimeStepNode',
        data: {
          head: searchResults,
          edges: {
            position: [0, 0],
            handle_id: nanoid(),
          },
          onNodeSelect: handleNodeSelect,
          highlightMode: highlightMode,
        },
        position: { x: 150, y: 100 },
      }];
      setNodes(newNodes);

      // set cost
      const cost = determine_cost(searchResults);
      highlightCost(searchResults, cost);

      const time = determine_min_time(searchResults);
      highlightTime(searchResults, time);
      
    }

    
  }, [searchResults, handleNodeSelect, highlightMode, nodes.length]);


  {
    useEffect(() => {
      const savedParsedData = localStorage.getItem('parsedData');


      if (savedParsedData) {
        const parsedDataObj = JSON.parse(savedParsedData);
        setParsedData(parsedDataObj);
      }
      const savedRobots = localStorage.getItem('robots');
      if (savedRobots) {
        setRobots(JSON.parse(savedRobots));
      } else {
        alert("No robots found in local storage. Please set the robot parameters first.");
        window.location.href = '/belief-graph';
        return;
      }
    }, []);


  }

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

        <div className="justify-center items-center flex flex-col">
          <AsciiAnimation
            frames={frames}
            frameRate={2}
          />
        </div>
        <div className="flex-1">
            <ReactFlow
            defaultEdgeOptions={{ animated: true }}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            proOptions={{ hideAttribution: true }}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            >
            <ReactFlowWrapper onReorganizeLayout={handleReactFlowInstance}>
              <Controls />
              <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
              <Legend 
                onHighlightModeChange={handleHighlightModeChange}
                currentMode={highlightMode}
                onReorganizeLayout={handleReorganizeLayout}
                onClearTree={handleClearTree}
              />
            </ReactFlowWrapper>
            </ReactFlow>
        </div>
      </div>
      



      <span className="absolute right-1 bottom-0">
        <Link href="/references">next</Link>
      </span>
    </div>
  );
}
