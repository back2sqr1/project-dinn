import { Digraph, Node, Edge, toDot } from 'ts-graphviz';
export default function createGraphFromBeliefDiagram(parsedData: any): any {
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