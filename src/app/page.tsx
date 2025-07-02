
'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import createGraphFromBeliefDiagram from '@/utils/createGraphFromBeliefDiagram';
import { useBeliefDiagramData } from '@/hooks/useBeliefDiagramData';
import { DEFAULT_BELIEF_DIAGRAM, validateBeliefDiagram } from '@/utils/beliefDiagramUtils';
import FileUploader from '@/components/FileUploader';
import DiagramDisplay from '@/components/DiagramDisplay';
import TypewriterText from '@/components/TypewriterText';

export default function Home() {
  const [graph, setGraph] = useState<any>();
  const { parsedData, updateData, getParsedObject } = useBeliefDiagramData(DEFAULT_BELIEF_DIAGRAM);

  // Update graph when data changes
  useEffect(() => {
    const dataObject = getParsedObject();
    if (dataObject && validateBeliefDiagram(dataObject)) {
      const newGraph = createGraphFromBeliefDiagram(dataObject);
      setGraph(newGraph);
    }
  }, [parsedData]); // Only depend on parsedData, not the function

  const handleFileLoad = (data: any) => {
    if (validateBeliefDiagram(data)) {
      updateData(data);
    } else {
      alert('Invalid belief diagram structure');
    }
  };

  const handleFileError = (error: string) => {
    alert(`Error: ${error}`);
  };

  return (
    <div className="retro-container relative">
      <section id="screen-1">
        <article>
          <header>
            <h1>
              <TypewriterText 
                text="Belief Diagram" 
                typeSpeed={50} 
              />
            </h1>
          </header>
          <hr />
          
          <TypewriterText 
            text="Input the belief diagram file below. The file should be a text file containing the belief diagram data in the specified format."
          />
          <br />
          
          <FileUploader 
            onFileLoad={handleFileLoad}
            onError={handleFileError}
            accept=".json"
          />
          <br />
          <br />
          
          <DiagramDisplay 
            graph={graph}
            data={getParsedObject()}
          />
        </article>
        
        <span className="absolute right-1 bottom-0">
          <Link href="/belief-graph">next</Link>
        </span>
      </section>
    </div>
  );
}