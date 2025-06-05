import { Digraph, Node, Edge, toDot } from 'ts-graphviz';




function euclidean_distance(location_a: any, location_b: any): number {
    return Math.sqrt(
        Math.pow(location_a[0] - location_b[0], 2) +
        Math.pow(location_a[1] - location_b[1], 2)
    );
}

export function location_set(parsedData: any) : Array<[number, number, string]> {
    const locations: Array<[number, number, string]> = [];
    parsedData.nodes && Object.keys(parsedData.nodes).forEach(nodeId => {
        const nodeData = parsedData.nodes[nodeId];
        if (nodeData.location) {
            const location = nodeData.location;
            if (Array.isArray(location) && location.length === 2) {
                locations.push([location[0], location[1], nodeId]);
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
    if (!parsedData || !graph || !robots) {
        return null;
    }

    const newGraph = new Digraph();

    const locations = location_set(parsedData);
    const searchTree: any = {}; // contains ids of each node and its edges

    const r_list = robots.map((robot: any) => robot.location);

    const currentQuestion = parsedData.nodes[parsedData.starting_question];
    let queue = [r_list];

    while (queue.length > 0) {
        const currentRobots = queue.shift();
        if (!currentRobots || currentRobots.length === 0) {
            alert("No robots found in local storage. Please set the robot parameters first.");
            continue;
        }

        // for each location
        // for (const location of locations) {
        //     const [x, y, nodeId] = location;
            
        //     // For each robot, calculate if it can move to this location
        //     for (let robotIndex = 0; robotIndex < currentRobots.length; robotIndex++) {
        //         const robot = { location: currentRobots[robotIndex] };
        //         const targetNode = { location: [x, y] };
                
        //         const cost = cost_function(robot, targetNode);
                
        //         if (cost !== Infinity) {
        //             // Create new robot configuration with this robot moved to the new location
        //             const newRobotConfig = [...currentRobots];
        //             newRobotConfig[robotIndex] = [x, y];
                    
        //             // Add this new configuration to the queue if not already processed
        //             const configKey = JSON.stringify(newRobotConfig);
        //             if (!searchTree[configKey]) {
        //                 searchTree[configKey] = {
        //                     robots: newRobotConfig,
        //                     cost: cost,
        //                     parent: JSON.stringify(currentRobots)
        //                 };
        //                 queue.push(newRobotConfig);
                        
        //                 // Add node to graph
        //                 newGraph.addNode(configKey, { label: `Robots at: ${configKey}` });
        //                 if (searchTree[JSON.stringify(currentRobots)]) {
        //                     newGraph.addEdge(JSON.stringify(currentRobots), configKey, { label: `Cost: ${cost}` });
        //                 }
        //             }
        //         }
        //     }
        // } 
    }

    return [searchTree, newGraph];

}
