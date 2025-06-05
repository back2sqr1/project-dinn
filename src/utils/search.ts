import { Digraph, Node, Edge, toDot } from 'ts-graphviz';

function euclidean_distance(location_a: any, location_b: any): number {
    return Math.sqrt(
        Math.pow(location_a[0] - location_b[0], 2) +
        Math.pow(location_a[1] - location_b[1], 2)
    );
}

function location_set(parsedData: any) : Set<[number, number]> {
    const locations = new Set<[number, number]>();
    parsedData.nodes && Object.keys(parsedData.nodes).forEach(nodeId => {
        const nodeData = parsedData.nodes[nodeId];
        if (nodeData.location) {
            const location = nodeData.location;
            if (Array.isArray(location) && location.length === 2) {
                locations.add([location[0], location[1]]);  
            } else {
                console.warn(`Invalid location format for node ${nodeId}: ${location}`);
            }
        }
    });
    return locations;
}

function cost_function(robot : any, question : any) {
    const robot_location = robot.location;
    const question_location = question.location;

    if (!robot_location || !question_location) {
        console.warn(`Invalid robot or question location`);
        return Infinity;
    }

    const distance = euclidean_distance(robot_location, question_location);
    return distance;
}




export default function search(parsedData : any, graph: any, robots: any): any {
    
}
