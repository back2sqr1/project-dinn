'use client';
import { Typewriter } from 'nextjs-simple-typewriter'
import Link from "next/link";
import dynamic from 'next/dynamic';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import search from '@/utils/search';
import { TimeStepNode } from '@/utils/search';


import { nanoid } from 'nanoid';
import '@xyflow/react/dist/style.css';
import '@/styles/override_xy.css';
import XYTimeStepNode from '@/components/XYTimeStepNode';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';

import createGraphFromBeliefDiagram from '@/utils/createGraphFromBeliefDiagram';
import { parse } from 'path';
import { toDot } from 'ts-graphviz';


const Graphviz = dynamic(() => import('graphviz-react'), { ssr: false });

import AsciiAnimation from '@/components/AsciiAnimation';
import generateFrames from '@/utils/generateFrames';



const initialNodes = [
  {
    id: '1',
    data: {},
    type: 'xyTimeStepNode',
    position: { x: 0, y: 0 },
  },
  {
    id: '2',
    type: 'xyTimeStepNode',
    data: {},
    position: { x: 100, y: 100 },
  },
]

const initialEdges = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
  },
];

export default function Home() {
  /*
  Parsed Data - Contains Node set, Names, Edges, and Everything
  Graph - Contains the graph representation of the belief diagram
  Robots - Contains the robot parameters, such as location and velocity
  */
  const [parsedData, setParsedData] = useState<any>(null);
  const [robots, setRobots] = useState<any[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );
  const nodeTypes = useMemo(() => ({ xyTimeStepNode: XYTimeStepNode }), []);


  const frames = generateFrames(parsedData, robots);
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
          }
        },
        position: { x: 150, y: 100 },
      }];
      setNodes(newNodes);
    }
  }, [searchResults]);


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
            onConnect={onConnect}
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
