import { nanoid } from 'nanoid';
import { euclidean_distance, location_set, _location_to_prop, properties_set } from './props_and_locations';
import { TimeStepNode } from '@/utils/TimeStepNode';
import { RobotManager } from '@/utils/RobotManager';


function printTimeSteps(robotManager: RobotManager) {
    if (!robotManager.head_time_step) {
        console.log("No time steps available.");
        return;
    }
    console.log("Time Steps:");
    console.log(robotManager.head_time_step.toString());
}

export default function search(parsedData : any, robots: any): TimeStepNode | null {
    if (!parsedData || !robots) {
        return null;
    }
    const locations = location_set(parsedData);
    const props = properties_set(parsedData);
    const prop_to_location = parsedData.prop_to_location || {};
    const location_to_prop = _location_to_prop(prop_to_location);
    const starting_prop = parsedData.starting_prop || "p";

    // cast next_query to Map<string, Array<string>>
    const next_query = new Map<string, Array<string>>(Object.entries(parsedData.edges));

    const robot_manager = new RobotManager(robots, locations, location_to_prop, next_query, starting_prop);
    
    /* Strategy:
        1. Generate all combinations of robot assignments to locations for the starting property.
        2. For each combination, assign robots to locations.
        3. Update robot positions based on the earliest arrival time. (do all robots and have the robots wait)
    */
    while(robot_manager.time_step_queue.size() > 0) {
        const currentTimeStep = robot_manager.time_step_queue.dequeue();
        const robotMap_0 = currentTimeStep?.robot_map;
        if (!robotMap_0) {
            console.error("No robot map found in the current time step.");
            continue;
        }
        let robotMap = structuredClone(robotMap_0);

        const combinations = robot_manager.generateCombinations(currentTimeStep.query, robotMap, currentTimeStep.visitedLocations);
        for (const combination of combinations) {
        // for (let i = 0; i < 3; i++) {
            const visitedLocations_thisStep = new Set<string>();
            // Assign robots to locations based on the current combination
            for( const [robotId, location] of combination.entries()) {
                robot_manager.assignRobotToLocation(robotId, location, robotMap);
            }
            
            /* update locations going to visit */
            // adds cost and time
            const max_iterations = 2;
            let iteration = 0;
            // Make Robot Moving Node as positions are updated
            
            let curNode = currentTimeStep;

            while (robot_manager.countTravelingRobots(robotMap) > 0 && iteration < max_iterations) {
                robot_manager.updateRobotPositions(robotMap);
                const robot_moving_node = new TimeStepNode({
                    id: nanoid(),
                    robot_map: structuredClone(robotMap),
                    query: curNode.query,
                    next: [],
                    type: 'Robot Moving',
                    resolvedQuestions: structuredClone(curNode.resolvedQuestions)
                });
                robot_moving_node.visitedLocations = new Set([...curNode.visitedLocations]);
                if (curNode.next === null) {
                    curNode.next = [];
                }
                curNode.next.push(robot_moving_node);
                curNode = robot_moving_node; // Update current node to the new moving node
                iteration++;
            }

            // Check if robot has reached its destination
            for (const [robotId, robot] of robotMap.entries()) {
                if (robot.assignedLoc) {
                    const targetLocation = robot_manager.location_set.get(robot.assignedLoc);
                    if (targetLocation && euclidean_distance(robot.position, targetLocation) < 0.01) {
                        // Robot has reached its destination, mark it as assigned
                        visitedLocations_thisStep.add(robot.assignedLoc);
                    }
                }
            }
            // Make Query Node

            const query_node = new TimeStepNode({
                id: nanoid(),
                robot_map: structuredClone(robotMap),
                query: curNode.query,
                next: [],
                type: 'Query',
                resolvedQuestions: structuredClone(curNode.resolvedQuestions)
            });
            query_node.visitedLocations = new Set([...curNode.visitedLocations]);

            if (curNode.next === null) {
                curNode.next = [];
            }
            curNode.next.push(query_node);
            
            robot_manager.updateTimeStep(query_node, visitedLocations_thisStep);
            robotMap = structuredClone(robotMap_0); // Reset robot map for the next combination
        }

    }
    // printTimeSteps(robot_manager); // Print the time steps for debugging
    return robot_manager.head_time_step; // Return the head of the time step tree
}
