'use client';
import { Typewriter } from 'nextjs-simple-typewriter'
import Link from "next/link";
import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';
import { toDot } from 'ts-graphviz';


import createGraphFromBeliefDiagram from '@/utils/createGraphFromBeliefDiagram';

const Graphviz = dynamic(() => import('graphviz-react'), { ssr: false });

export default function Home() {
  const [parsedData, setParsedData] = useState<any>(null);
  const [graph, setGraph] = useState<any>();
  
  useEffect(() => {
    const savedParsedData = localStorage.getItem('parsedData');
  
    
    if (savedParsedData) {
      const parsedDataObj = JSON.parse(savedParsedData);
      setParsedData(JSON.stringify(parsedDataObj, null, 2));
      const newGraph = createGraphFromBeliefDiagram(parsedDataObj);
      setGraph(newGraph);

    }
  }, []);

  useEffect(() => {
    if (parsedData) {
      localStorage.setItem('parsedData', parsedData);    }
  }, [parsedData]);
  
  return (
    <div className="retro-container relative">
      <span className = "absolute left-1 bottom-0">
        <Link href="/belief-graph">prev</Link>
      </span>
      {parsedData && (
        <div className="output">
          <h2>Belief Diagram Output</h2>
          <Graphviz dot={toDot(graph)} />

        </div>
      )} 
      <span className = "absolute right-1 bottom-0">
        <Link href="/anim">next</Link>
      </span>
    </div>
  );
}
