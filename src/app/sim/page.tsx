'use client';
import { Typewriter } from 'nextjs-simple-typewriter'
import Link from "next/link";
import dynamic from 'next/dynamic';
import React, { useState, useEffect, useMemo } from 'react';
import { toDot } from 'ts-graphviz';
import search from '@/utils/search';


import createGraphFromBeliefDiagram from '@/utils/createGraphFromBeliefDiagram';
import { parse } from 'path';

const Graphviz = dynamic(() => import('graphviz-react'), { ssr: false });

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
  // const [searchTree, setSearchTree] = useState<any>();
  const frames = generateFrames(parsedData, robots);
  const searchResults = useMemo(() => 
    search(parsedData, robots), 
    [parsedData, robots]
  );
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
      <section>
        <header>
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
        </header>
        <hr />

        <article>
          <br />
          <div className="p-2 justify-center text-center ">
            <AsciiAnimation
              frames={frames}
              frameRate={2}
              fontSize="clamp(18px, 3vw, 30px)"
            />
          </div>

            
        </article>

      </section>
      <span className="absolute right-1 bottom-0">
        <Link href="/references">next</Link>
      </span>
    </div>
  );
}
