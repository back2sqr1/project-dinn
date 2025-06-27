import { Queue } from '@/utils/Queue';
import { nanoid } from 'nanoid';
import { euclidean_distance, _location_to_pin, _location_to_prop } from './props_and_locations';
import { Robot } from '@/utils/Robot';
import { TimeStepNode } from '@/utils/TimeStepNode';
import { location_to_pin, location_to_prop, pin_to_location } from './search';

export type RobotMap = Map<string, Robot>;
function createRobotMap(robots: any[]): RobotMap {
    const robotMap = new Map<string, Robot>();
    for (const robot of robots) {
        if (robot.id && robot.velocity && Array.isArray(robot.position) && robot.position.length) {
            const robotInstance = new Robot({
                id: robot.id,
                velocity: robot.velocity,
                position: robot.position as [number, number],
                assignedLoc: robot.assignedLoc || null,
                time: robot.time || 0
            });
            robotMap.set(robot.id, robotInstance);
        }
    }
    return robotMap;
}


export class RobotManager {

    next_question: Map<string, Array<string>>;
    initial_question: string;
    // Persistency on states - Needs to be a tree structure
    head_time_step: TimeStepNode | null = null; // head of the time step tree

    // Queue of time steps to be processed
    // only contains ra nodes
    time_step_queue: Queue<TimeStepNode> = new Queue<TimeStepNode>();

    // time step tree initialization:
    /*
        The time step tree starts with an initial state
        * then as the tree is made, the next time step is added with its 
        own robot_map
        * Edges are added as the tree is being made
    */
    constructor(robots: any[], next_question: Map<string, Array<string>>, initial_question: string) {
        const initialRobotMap = createRobotMap(robots);

        this.next_question = next_question || null; // Set the next question if provided, otherwise null
        this.initial_question = initial_question;

        const robotMapCopy = structuredClone(initialRobotMap); // Create a deep copy of the initial robot map


        
        const startNode = new TimeStepNode({
            id: nanoid(),
            robot_map: robotMapCopy,
            query: initial_question,
            next: [],
            type: 'Robot Assignment',
            resolvedQuestions: new Map<string, string>()
        });

        this.head_time_step = new TimeStepNode({
            id: nanoid(),
            robot_map: robotMapCopy,
            query: initial_question,
            next: [startNode],
            type: 'Query',
            resolvedQuestions: new Map<string, string>()    
        }); // Set the head of the time step tree to the initial state

        this.time_step_queue = new Queue<TimeStepNode>(); // Initialize the time step queue
        this.time_step_queue.enqueue(startNode); // Enqueue the initial time step
    } 

    countTravelingRobots(robot_map: RobotMap): number {
        let count = 0;
        for (const robot of robot_map.values()) {
            const targetLocation = location_to_pin.get(robot.assignedLoc || '');
            if (targetLocation && euclidean_distance(robot.position, targetLocation) > 0.01) {
                count++;
            }
        }
        return count;
    }

    // Idea: through some sort of functionality, the user can click and
    // see the movement of the robots
    // makes edge from Robot Assignment node to Query
    possibleResolutions(index: number, knownProperties: Array<string>, resolvedQuestions: Map<string, string>) : Array<Map<string, string>> {
        const resolutions : Array<Map<string, string>> = [];
        const resolvedEntries = Array.from(resolvedQuestions.entries());
        if (index < 0 || index >= knownProperties.length) {
            resolutions.push(new Map(resolvedQuestions)); // If index is out of bounds, return the current resolutions
            return resolutions; // Return empty if index is out of bounds
        }
        const property = knownProperties[index]; // Get the property at the current index
        if (resolvedQuestions.has(property)) {
            // If the property is already resolved, return an empty array
            return this.possibleResolutions(index + 1, knownProperties, resolvedQuestions);
        }

        // If the property is not resolved, we can create two resolutions
        const trueResolution = new Map(resolvedQuestions);
        trueResolution.set(property, 'T');
        resolutions.push(...this.possibleResolutions(index + 1, knownProperties, trueResolution));

        const falseResolution = new Map(resolvedQuestions);
        falseResolution.set(property, 'F');
        resolutions.push(...this.possibleResolutions(index + 1, knownProperties, falseResolution));

        return resolutions;
    }

    // Updates the current time step with the new robot positions and resolved questions
    // and enqueues the next time step for processing
    

    // return true if the query is updated
    // return false if the query is not updated

    updateTimeStep(currentTimeStep: TimeStepNode, visitedLocations_thisStep: Set<string>) {
        // Make combinations of resolutions
        const resolvedQuestions = currentTimeStep.resolvedQuestions;
        const robot_map = currentTimeStep.robot_map;
        
        const knownProperties = new Set<string>();
        for (const location of visitedLocations_thisStep) {
            if (location_to_prop[location]) {
                for (const prop of location_to_prop[location]) {
                    knownProperties.add(prop);
                }
            }
        }
        const query = structuredClone(currentTimeStep.query);

        const possibleResolutions = this.possibleResolutions(0, Array.from(knownProperties), resolvedQuestions);

        for (const resolution of possibleResolutions) {
            // determine the next question based on the resolution
            let nextQuestion = structuredClone(query);
            while (resolution.has(nextQuestion)) {
                const truth = resolution.get(nextQuestion) === 'T';
                if(truth) {
                    nextQuestion = this.next_question.get(nextQuestion)?.[1] || '';                    
                } else {
                    nextQuestion = this.next_question.get(nextQuestion)?.[0] || '';
                }
            }
            const nextTimeStep = new TimeStepNode({
                id: nanoid(),
                robot_map: structuredClone(robot_map),
                next: [],
                type: 'Robot Assignment',
                query: nextQuestion || '',
                resolvedQuestions: structuredClone(resolution)
            });
            nextTimeStep.visitedLocations = new Set([...currentTimeStep.visitedLocations, ...visitedLocations_thisStep]);
            currentTimeStep.next = currentTimeStep.next || [];
            currentTimeStep.next.push(nextTimeStep);

            if( nextQuestion != "true" && nextQuestion != "false") {
                // Enqueue the next time step for processing
                this.time_step_queue.enqueue(nextTimeStep);
            }

        }
    }
 
    // Updates the robot positions incremenetally where
    // the robot with the earliest arrival time reaches its destination
    // then all other robots move towards its goal
    updateRobotPositions(robot_map: RobotMap) : Array<Robot> {
        // find the robot with the earliest arrival time to destination
        let minimumArrivalTime = Infinity;
        const robots_that_arrived = Array<Robot>();

        for (const [robotId, robot] of robot_map.entries()) {
            let arrivalTime = robot.time;
            if(robot.assignedLoc) {
                const location_pin = location_to_pin.get(robot.assignedLoc);

                const dist = euclidean_distance(location_pin, robot.position);

                if (dist < 0.01) {
                    robots_that_arrived.push(robot);
                    continue;
                } else if (arrivalTime + dist / robot.velocity < minimumArrivalTime) {
                    arrivalTime = robot.time + dist / robot.velocity;
                    minimumArrivalTime = arrivalTime;
                }
            }
        }

        function moveRobotTowardsLocation(robot: Robot, targetLocation: [number, number], time_diff: number) {
            const distance = euclidean_distance(robot.position, targetLocation);
            const maxTravelTime = robot.velocity * time_diff;
            const tolerance = 0.01;
            if (distance * robot.velocity < maxTravelTime) {
                // Robot is already at the target location or can reach it
                // within the tolerance
                robot.position = [targetLocation[0], targetLocation[1]];
            } 
            else if (Math.abs(maxTravelTime - distance) <= tolerance) {
                // Robot reaches the target location
                robot.position = [targetLocation[0], targetLocation[1]];
            } else {
                // Robot moves towards the target location
                const direction = [
                    targetLocation[0] - robot.position[0],
                    targetLocation[1] - robot.position[1]
                ];
                const directionMagnitude = Math.sqrt(direction[0] ** 2 + direction[1] ** 2);
                const normalizedDirection = [
                    direction[0] / directionMagnitude,
                    direction[1] / directionMagnitude
                ];
                
                robot.position = [
                    robot.position[0] + normalizedDirection[0] * maxTravelTime,
                    robot.position[1] + normalizedDirection[1] * maxTravelTime
                ];
            }
            // Adding Cost to the robot based on distance
            robot.cost += distance;
        }

        // update time and position based on earliest arrival time
        

        for (const [robotId, robot] of robot_map.entries()) {
            const time_diff = minimumArrivalTime - robot.time;
            robot.time = minimumArrivalTime;
            // Calculate new position based on movement towards assigned location
            if (robot.assignedLoc) {
                const targetLocation = location_to_pin.get(robot.assignedLoc);
                moveRobotTowardsLocation(robot, targetLocation || robot.position, time_diff);
            }

        }
        return robots_that_arrived;
    }
    // currently we will only assign robots only when a new query is determined
    assignRobotToLocation(robotId: string, location: string, robot_map: RobotMap) {
        const robot = robot_map.get(robotId);
        if (robot) {
            robot.assignedLoc = location;
        }
    }

    /*
        function generateCombinations()

        goal: Generate all possible combinations of robot assignments to locations

        parameters: property : string
        return Array<Map<string, Robot>> (where the key is the robotID, and Robot is the robot with its assignment)


        n^m algorithm where n is the number of locations and m is the number of robots
        - Requirements : one robot must be assigned to the location
        - no two robot must be assigned to the same location
        - All other robots can go to any location or even stay still
        
    */
    generateCombinations(property: string, robot_map: RobotMap, visitedLocations: Set<string>): Array<Map<string, string>> {
        const locations = Array.from(location_to_pin.keys());
        const robotIds = Array.from(robot_map.keys());
        const combinations: Array<Map<string, string>> = [];
        
        // Get locations for the specific property
        const propertyLocations = locations.filter(loc => {
            // This would need to be updated based on how property-location mapping is stored
            return location_to_prop[loc] && location_to_prop[loc].includes(property);
        });

        if (propertyLocations.length === 0) {
            return combinations;
        }

        // Generate all possible assignments
        function generateAssignments(robotIndex: number, currentAssignment: Map<string, string>, usedLocations: Set<string>) {
            if (robotIndex === robotIds.length) {
                // Check if at least one robot is assigned to a the property location
                if (Array.from(currentAssignment.values()).some(loc => propertyLocations.includes(loc))) {
                    combinations.push(new Map(currentAssignment));
                }
                return;
            }
            
            const robotId = robotIds[robotIndex];
            
            // Option 1: Don't assign this robot (stays still)
            generateAssignments(robotIndex + 1, currentAssignment, usedLocations);
            
            // Option 2: Assign robot to available locations
            for (const location of locations) {
                if (!usedLocations.has(location)) {
                    const newAssignment = new Map(currentAssignment);
                    const newUsedLocations = new Set(usedLocations);
                    newAssignment.set(robotId, location);
                    newUsedLocations.add(location);
                    
                    generateAssignments(robotIndex + 1, newAssignment, newUsedLocations);
                }
            }
        }
        
        generateAssignments(0, new Map(), new Set(visitedLocations));
        return combinations;
    }

}