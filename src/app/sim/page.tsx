'use client';
import { Typewriter } from 'nextjs-simple-typewriter'
import Link from "next/link";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import search from '@/utils/search';
import { TimeStepNode } from '@/utils/TimeStepNode';


import { nanoid } from 'nanoid';
import '@xyflow/react/dist/style.css';
import '@/styles/override_xy.css';
import XYTimeStepNode from '@/components/XYTimeStepNode';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';

import AsciiAnimation from '@/components/AsciiAnimation';
import generateFrames from '@/utils/generateFrames';


export default function Home() {
  /*
  Parsed Data - Contains Node set, Names, Edges, and Everything
  Graph - Contains the graph representation of the belief diagram
  Robots - Contains the robot parameters, such as location and velocity
  */
  const [parsedData, setParsedData] = useState<any>(null);
  const [robots, setRobots] = useState<any[]>([]);
  const [selectedRobotMap, setSelectedRobotMap] = useState<Map<string, any> | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([{ id: '1', data: {}, type: 'xyTimeStepNode', position: { x: 0, y: 0 } }]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([{ id: 'e1-2', source: '1', target: '2' }]);
  const [frames, setFrames] = useState<string[]>([]);
  const nodeTypes = useMemo(() => ({ xyTimeStepNode: XYTimeStepNode }), []);

  const handleNodeSelect = useCallback((robotMap: Map<string, any>) => {
    setSelectedRobotMap(robotMap);
  }, []);


  useEffect(() => {
    const robotsToUse = selectedRobotMap || robots;
    const newFrames = generateFrames(parsedData, robotsToUse);
    setFrames(newFrames);
  }, [parsedData, robots, selectedRobotMap]);

  // search returns a TimeStepNode or null
  const searchResults = useMemo((): TimeStepNode | null =>
    search(parsedData, robots),
    [parsedData, robots]
  );

  useEffect(() => {
    if (searchResults) {
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
        },
        position: { x: 150, y: 100 },
      }];
      setNodes(newNodes);
    }
  }, [searchResults, handleNodeSelect]);


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
            >
            <Controls />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            
            </ReactFlow>
        </div>
      </div>
      



      <span className="absolute right-1 bottom-0">
        <Link href="/references">next</Link>
      </span>
    </div>
  );
}
