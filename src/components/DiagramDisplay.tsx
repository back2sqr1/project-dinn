import React from 'react';
import dynamic from 'next/dynamic';
import { toDot } from 'ts-graphviz';
import LocationsTable from './LocationsTable';

const Graphviz = dynamic(() => import('graphviz-react'), { ssr: false });

interface DiagramDisplayProps {
  graph: any;
  data: any;
}

export default function DiagramDisplay({ graph, data }: DiagramDisplayProps) {
  if (!graph || !data) return null;

  return (
    <div className="output flex">
      <Graphviz dot={toDot(graph)} />
      <div className="locations-chart"></div>
      <LocationsTable data={data} />
    </div>
  );
}
