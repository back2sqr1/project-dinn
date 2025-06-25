import { Digraph, Node, Edge, toDot } from 'ts-graphviz';
export default function createGraphFromBeliefDiagram(parsedData: any): any {
  const newGraph = new Digraph("G", {
    bgcolor: "transparent"
  });
    

    // Add nodes for each proposition
    parsedData.props.forEach((prop: string) => {
      const node = new Node(prop, {
        shape: 'oval',
        fontcolor: 'green',
        color: 'green'
      });
      newGraph.addNode(node);
    });

    // Add edges between propositions
    Object.entries(parsedData.edges).forEach(([from, targets]) => {
      
      const to1 = (targets as string[])[0];
      if (to1) {
        const fromNode = newGraph.getNode(from);
        const toNode = newGraph.getNode(to1);
        if (fromNode && toNode) {
          const edge = new Edge([fromNode, toNode], {
            color: 'green',
            style: 'dashed',
          });
          newGraph.addEdge(edge);
        }
      }
      const to2 = (targets as string[])[1];
      if (to1) {
        const fromNode = newGraph.getNode(from);
        const toNode = newGraph.getNode(to2);
        if (fromNode && toNode) {
          const edge = new Edge([fromNode, toNode], {
            color: 'green',
          });
          newGraph.addEdge(edge);
        }
      }
    });

    return newGraph;
}