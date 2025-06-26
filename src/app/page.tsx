
'use client';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { toDot } from 'ts-graphviz';
import { Typewriter } from 'nextjs-simple-typewriter';
import Link from 'next/link';
import createGraphFromBeliefDiagram from '@/utils/createGraphFromBeliefDiagram';

const Graphviz = dynamic(() => import('graphviz-react'), { ssr: false });

export default function Home() {
  const [graph, setGraph] = useState<any>();
  const [parsedData, setParsedData] = useState<any>(null);

  // Load saved data on mount
  useEffect(() => {
    const savedParsedData = localStorage.getItem('parsedData');
    if (savedParsedData) {
      const parsedDataObj = JSON.parse(savedParsedData);
      setParsedData(JSON.stringify(parsedDataObj, null, 2));
      const newGraph = createGraphFromBeliefDiagram(parsedDataObj);
      setGraph(newGraph);
    }
  }, []);

  // Save data when it changes
  useEffect(() => {
    if (parsedData) {
      localStorage.setItem('parsedData', parsedData);
    }
  }, [parsedData]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const jsonContent = e.target?.result as string;
      try {
        const parsedDataObj = JSON.parse(jsonContent);
        setParsedData(JSON.stringify(parsedDataObj, null, 2));
        const newGraph = createGraphFromBeliefDiagram(parsedDataObj);
        setGraph(newGraph);
      } catch (error) {
        setParsedData('Error: Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="retro-container relative">
      <section id="screen-1">
        <article>
          <header>
            <h1>
              <Typewriter
                words={['Belief Diagram']}
                loop={1}
                cursor
                cursorStyle=''
                typeSpeed={50}
                deleteSpeed={50}
                delaySpeed={1000}
              />
            </h1>
          </header>
          <hr />
          
          <Typewriter
            words={['Input the belief diagram file below. The file should be a text file containing the belief diagram data in the specified format.']}
            loop={1}
            cursor
            cursorStyle=''
            typeSpeed={30}
            deleteSpeed={50}
            delaySpeed={1000}
          />
          <br />
          
          <input 
            className="file-input" 
            type="file" 
            id="belief-diagram-file-input" 
            accept=".json" 
            onChange={handleFileChange} 
          />
          <br />
          <br />
          
          {parsedData && (
            <div className="output flex">
              <Graphviz dot={toDot(graph)} />
              <div className="locations-chart"></div>
              <table className="locations-table w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">Loc</th>
                    <th className="px-4 py-2 text-left">Pin</th>
                    <th className="px-4 py-2 text-left">Prop</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(JSON.parse(parsedData).locations).map(([locationId, locationData]: [string, any]) => {
                    const properties = Object.entries(JSON.parse(parsedData).prop_to_location)
                      .filter(([, locations]) => Array.isArray(locations) && locations.includes(locationId))
                      .map(([prop]) => prop);
                    
                    return (
                      <tr key={locationId}>
                        <td className="px-4 py-2">{locationId}</td>
                        <td className="px-4 py-2">[{locationData.pin.join(', ')}]</td>
                        <td className="px-4 py-2">{properties.length > 0 ? properties.join(', ') : 'None'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </article>
        
        <span className="absolute right-1 bottom-0">
          <Link href="/belief-graph">next</Link>
        </span>
      </section>
    </div>
  );
}