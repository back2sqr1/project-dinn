'use client';
import { Typewriter } from 'nextjs-simple-typewriter'
import Link from "next/link";
import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';
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

            {parsedData && robots.length > 0 && (
            <>
              {/* <div className="justify-center w-full text-center"> 
                <Graphviz
                dot={toDot(search(parsedData, robots))}
                options={{
                  zoom: true,
                  useMaxWidth: true,
                }}
                />
              </div> */}
              <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => {
                const dotContent = toDot(search(parsedData, robots));
                const blob = new Blob([dotContent], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'search-graph.dot';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              >
              Download DOT File
              </button>
            </>
            )}
        </article>

      </section>
      <span className="absolute right-1 bottom-0">
        <Link href="/references">next</Link>
      </span>
    </div>
  );
}
