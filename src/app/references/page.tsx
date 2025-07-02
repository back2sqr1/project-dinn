'use client';
import { Typewriter } from 'nextjs-simple-typewriter'
import Link from "next/link";
import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';
import { toDot } from 'ts-graphviz';


import createGraphFromBeliefDiagram from '@/utils/createGraphFromBeliefDiagram';




export default function Home() {
  /*
  Parsed Data - Contains Node set, Names, Edges, and Everything
  Graph - Contains the graph representation of the belief diagram
  Robots - Contains the robot parameters, such as location and velocity
  */
  const [parsedData, setParsedData] = useState<any>(null);
  const [graph, setGraph] = useState<any>();
  const [robots, setRobots] = useState<any[]>([]);
  {
    useEffect(() => {
      const savedParsedData = localStorage.getItem('parsedData');
    
      
      if (savedParsedData) {
        const parsedDataObj = JSON.parse(savedParsedData);
        setParsedData(parsedDataObj);
        const newGraph = createGraphFromBeliefDiagram(parsedDataObj);
        setGraph(newGraph);

      }
    }, []);

    useEffect(() => {
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
      <span className = "absolute left-1 bottom-0">
        <Link href="/sim">prev</Link>
      </span>
      <section>
        <header>
          <h1>
            <Typewriter
              words={['References']}
              loop={1}
              cursor
              cursorStyle=''
              typeSpeed={30}
              deleteSpeed={50}
              delaySpeed={1000}
            />
          </h1>
        </header>
        <hr />

        <article>
          <br/>
          <div className="p-2 " style={{ fontSize: "10px" }}>
            <code>
                {JSON.stringify(parsedData, null, 2)}
            </code>
            <br/>
            <code>
              <pre>
                
              </pre>
            </code>
          </div>
        </article>

      </section>
      {/* <span className = "absolute right-1 bottom-0">
        <Link href="/references">next</Link>
      </span> */}
    </div>
  );
}
