import { Digraph, Node, Edge, toDot } from 'ts-graphviz';
import { Queue } from '@/utils/Queue';



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

function cost_function(robot_location : any, location : any) {
    const distance = euclidean_distance(robot_location, location);
    return distance;
}


function generateCombinations(
  locations: Array<[number, number, string]>,
  robots: any[]
): Array<Array<[number, number, string]>> {
  const result: Array<Array<[number, number, string]>> = [];
  const combination: Array<[number, number, string]> = new Array(robots.length);

  function recurse(position: number): void {
    if (position === robots.length) {
      result.push([...combination]); // Add a copy of the current combination
      return;
    }

    for (const loc of locations) {
      combination[position] = loc;
      recurse(position + 1);
    }
  }

  recurse(0);
  return result;
}




function getName(r_list: any, question: string, cost_array: number[]): string {
    if (!r_list || r_list.length === 0 || !question || !cost_array || cost_array.length === 0) {
        return '';
    }
    return r_list.map((robot: any, index: number) => {
        const cost: number = Math.round(cost_array[index]);
        return `${robot.id} at ${robot.location} with question ${question} (cost: ${cost})`;
    }).join('\n');
}

export default function search(parsedData : any, robots: any): any {
    if (!parsedData || !robots) {
        return null;
    }
    console.log("CALLED");

    const newGraph = new Digraph();

    const locations = location_set(parsedData);

    const r_list = robots;

    const cost_array = r_list.map((robot: any) => 0);
    let queue = new Queue<[any[], string, number[]]>();
    queue.enqueue([r_list, parsedData.starting_question, cost_array]);

    const edges = parsedData.edges || [];
    
    const initialNode = new Node(getName(r_list, parsedData.starting_question, cost_array));
    newGraph.addNode(initialNode);

    while (queue.size() > 0) {
        // None of the robots should be at the question location
        const [curRobots, question_code, cost] = queue.dequeue()!;
        // GRAPHVIZ
        const node = newGraph.getNode(getName(curRobots, question_code, cost));
        if (!node) {
            console.warn(`Node not found for current state: ${getName(curRobots, question_code, cost)}`);
            continue;
        }

        for (let i = 0; i < curRobots.length; i++) {
            const newRobots = curRobots.map((r: any) => ({ ...r }));
            newRobots[i].location = parsedData.nodes[question_code].location; // move robot to question location

            // calculate cost
            const costValue = cost_function(curRobots[i].location, newRobots[i].location);
            const newCosts = [...cost];
            newCosts[i] += costValue;

            // new question based on edges
            // should be true or false in the easy case

            if (question_code == 'e' || question_code == 'd') {
                const newNode = new Node(getName(newRobots, "END", newCosts));
                newGraph.addNode(newNode);
                const graphviz_edge = new Edge([node, newNode], {});
                newGraph.addEdge(graphviz_edge);
            }
            else if (!edges[question_code]) {
                console.warn(`No edges found for question code: ${question_code}`);
                continue;
            }
            else {
                for(const edge of edges[question_code]) {
                    console.log(`Creating edge from ${node} to ${edge}`);
                    const newQuestionCode = edge; // assuming edge is the question code
                    const newNode = new Node(getName(newRobots, newQuestionCode, newCosts));
                    newGraph.addNode(newNode);
                    const graphviz_edge = new Edge([node, newNode], {});
                    newGraph.addEdge(graphviz_edge);
                    queue.enqueue([newRobots, newQuestionCode, newCosts]);
                    
                }
                
            }
        }

        // for each location
        // const combinations = generateCombinations(locations, curRobots);
        // // console.log("Combinations: ", combinations);
        // for (const newLocs of combinations) {
        //     // check if valid
        //     // combinations assign each robot to a location
        //     let valid = false;
        //     for (let i = 0; i < newLocs.length; i++) {
        //         if (newLocs[i][2] == question_code) {
        //             valid = true;
        //             break;
        //         }
        //     }
        //     if (!valid) {
        //         continue; // skip this combination if no robot is at the question location
        //     }
        //     let newCosts = [...cost];
        //     let newRobots = curRobots.map((robot: any) => ({ ...robot }));
        //     for (let i = 0; i < newLocs.length; i++) {
        //         newRobots[i].location = [newLocs[i][0], newLocs[i][1]]; // update robot location
        //     }


        //     // calculate cost
        //     for (let i = 0; i < curRobots.length; i++) {
        //         const robot = curRobots[i];
        //         const costValue = cost_function(robot.location, newRobots[i].location);
        //         newCosts[i] += costValue;
        //         // console.log("Costs and New Costs: ", cost, newCosts);
        //     }
        //     // add the new state to the queue
        //     // new question based on edges
        //     // should be true or false in the easy case
        //     console.log("New Robots: ", newRobots);
        //     console.log("Question Code: ", question_code);
        //     // console.log("New Costs: ", newCosts);
        //     // console.log("Old robots: ", curRobots);
        //     // console.log("Old Costs: ", cost);
        //     for (const edge of edges[question_code] || []) {
        //         // GRAPHVIZ
        //         const newNode = new Node(getName(newRobots, edge, newCosts));
        //         const newQuestionCode = edge; // assuming edge is the question code
        //         newGraph.addNode(newNode);
        //         const graphviz_edge = new Edge([node, newNode], {});
        //         newGraph.addEdge(graphviz_edge);
        //         queue.enqueue([newRobots, newQuestionCode, newCosts]);
        //     }
        // }
        console.log("Queue size: ", queue.size(), queue);
    }
    // Convert the graph to DOT format
    return newGraph;
}
