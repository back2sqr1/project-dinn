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
      (targets as string[]).forEach((to: string) => {
        const fromNode = newGraph.getNode(from);
        const toNode = newGraph.getNode(to);
        if (fromNode && toNode) {
          const edge = new Edge([fromNode, toNode], {
            color: 'green'
          });
          newGraph.addEdge(edge);
        }
      });
    });

    return newGraph;
}