
'use client';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Digraph, Node, Edge, toDot } from 'ts-graphviz';
import { Typewriter } from 'nextjs-simple-typewriter'

const Graphviz = dynamic(() => import('graphviz-react'), { ssr: false });


function createGraphFromBeliefDiagram(parsedData: any): any {
  const newGraph = new Digraph("G", {
    bgcolor: "transparent"
  });
    

    // add nodes in nodes parsedData.nodes;
    parsedData.nodes && Object.keys(parsedData.nodes).forEach(nodeId => {
      const nodeData = parsedData.nodes[nodeId];
      const node = new Node(nodeId, {
        label: nodeData.question,
        color: "green",
        fontcolor: "green"
      });
      newGraph.addNode(node);
    });

    // add edges from parsedData.edges
    parsedData.edges && Object.keys(parsedData.edges).forEach(fromNode => {
      const toNodes = parsedData.edges[fromNode];
      const fromNodeObj = newGraph.getNode(fromNode);
      const falseNodeObj = newGraph.getNode(toNodes[0]);
      if (fromNodeObj && falseNodeObj) {
        const falseEdge = new Edge([fromNodeObj, falseNodeObj], {
          style: "dotted",
          color: "green",
        });
        newGraph.addEdge(falseEdge);
      }
      const truthNodeObj = newGraph.getNode(toNodes[1]);
      if (fromNodeObj && truthNodeObj) {
        const trueEdge = new Edge([fromNodeObj, truthNodeObj], {
          style: "solid",
          color: "green",
        });
        newGraph.addEdge(trueEdge);
      }
    });
    return newGraph;
}

export default function Home() {
  const [graph, setGraph] = useState<any>();
  const [parsedData, setParsedData] = useState<any>(null);


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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const jsonContent = e.target?.result as string;
        try {
          const parsedData = JSON.parse(jsonContent);
          setParsedData(JSON.stringify(parsedData, null, 2));
          
          const newGraph = createGraphFromBeliefDiagram(parsedData);
          setGraph(newGraph);
        } catch (error) {
          setParsedData('Error: Invalid JSON file');
        }
      };

      reader.readAsText(file);
    }
  };
  return (
    <section id="screen-1">
      <article>
          <header>
              <h1>Belief Diagram Input</h1>
          </header>
          <hr />
          <Typewriter
            words={['Input the belief diagram file below. The file should be a text file containing the belief diagram data in the specified format.']}
            loop={1}
            cursor
            cursorStyle=''
            typeSpeed={50}
            deleteSpeed={50}
            delaySpeed={1000}
          />
          <br/>
          
          <input className="file-input" type="file" id="belief-diagram-file-input" accept=".json" onChange={handleFileChange} />

          {parsedData && (
            <div className="output">
              <h2>Belief Diagram Output</h2>
              <Graphviz dot={toDot(graph)} />
            </div>
          )}

          
      </article>
    </section>
  );
}
