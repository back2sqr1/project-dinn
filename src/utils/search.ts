import { Queue } from '@/utils/Queue';
import { nanoid } from 'nanoid';
import next from 'next';

type RobotMap = Map<string, Robot>;
function euclidean_distance(location_a: any, location_b: any): number {
    return Math.sqrt(
        Math.pow(location_a[0] - location_b[0], 2) +
        Math.pow(location_a[1] - location_b[1], 2)
    );
}

export function location_set(parsedData: any) : Map<string, [number, number]> {
    const locations: Map<string, [number, number]> = new Map();
    for (const [key, value] of Object.entries(parsedData.locations)) {
        if (value && typeof value === 'object' && 'pin' in value) {
            const pin = (value as any).pin;
            if (Array.isArray(pin) && pin.length >= 2) {
                locations.set(key, [pin[0], pin[1]]);
            }
        }
    }
    return locations;
}

function properties_set(parsedData: any) : Array<string> {
    const properties: Array<string> = [];
    for (const [key, value] of Object.entries(parsedData.props)) {
        if (value && typeof value === 'string') {
            properties.push(value);
        }
    }
    return properties;
}

function _location_to_prop(prop_to_location: any) {
    const location_to_prop: { [key: string]: string[] } = {};
    for (const [prop, locations] of Object.entries(prop_to_location)) {
        for (const location of locations as string[]) {
            if (!location_to_prop[location]) {
                location_to_prop[location] = [];
            }
            location_to_prop[location].push(prop);
        }
    }
    return location_to_prop;
}

export class Robot {
    id: string;
    velocity: number;
    position: [number, number];
    assignedLoc: string | null;
    cost: number;
    time: number;

    constructor({
        id,
        velocity = 1,
        position = [0, 0],
        assignedLoc = null,
        time = 0,
        cost = 0
    }: {
        id: string;
        velocity?: number;
        position?: [number, number];
        assignedLoc?: string | null;
        time?: number;
        cost?: number;
    }) {
        this.id = id;
        this.velocity = velocity;
        this.position = position;
        this.assignedLoc = assignedLoc;
        this.time = time;
        this.cost = cost;
    }

    toString(): string {
        return `Robot[vel=${this.velocity}, pos=[${Math.round(this.position[0])}, ${Math.round(this.position[1])}], time=${Math.round(this.time)}, cost=${Math.round(this.cost)}]`;
    }

}

export class TimeStepNode {
    readonly id: string = nanoid();
    readonly robot_map: RobotMap;
    readonly query: string;
    next: TimeStepNode[] | null = [];
    visitedLocations: Set<string> = new Set();
    


    constructor({
        id = nanoid(),
        robot_map = new Map<string, Robot>(),
        query = '',
        next = null,
        
    }: {
        id : string;
        robot_map: RobotMap; 
        next: TimeStepNode[] | null; 
        query: string; 
    }) {
        this.id = id;
        this.robot_map = robot_map;
        this.next = next;
        this.query = query;
    }

    toString(indent: string = "", isLast: boolean = true, layer: number = 0): string {
        let result = indent;
        result += isLast ? "└── " : "├── ";
        result += `Layer ${layer} query: ${this.query} \n`;


        const entries = Array.from(this.robot_map.entries());
        entries.forEach(([robotId, robot], index) => {
            const last = index === entries.length - 1 && (!this.next || this.next.length === 0);
            result += indent + (isLast ? "    " : "│   ");
            result += last ? "└── " : "├── ";
            robot = (Robot as any).prototype instanceof Robot ? robot : new Robot(robot);
            // Ensure robot is an instance of Robot
            result += `${robotId}: ${robot.toString()}\n`;
        });
        if (this.visitedLocations.size > 0) {
            result += indent + (isLast ? "    " : "│   ") + "vis: ";
            result += Array.from(this.visitedLocations).join(", ") + "\n";
        }
        if (this.next) {
            this.next.forEach((node, index) => {
                const childIsLast = index === this.next!.length - 1;
                result += node.toString(indent + (isLast ? "    " : "│   "), childIsLast, layer + 1);
            });
        }
        
        

        return result;
    }
}

class RobotManager {
    location_set : Map<string, [number, number]>; // map of locations with their coordinates
    pin_to_location: Map<[number, number], string> = new Map(); // map of pin coordinates to location names
    location_to_prop: { [key: string]: string[] }; // map of locations to properties

    next_question: Map<string, Array<string>>;
    initial_question: string;
    // Persistency on states - Needs to be a tree structure
    head_time_step: TimeStepNode | null = null; // head of the time step tree

    // Queue of time steps to be processed
    time_step_queue: Queue<TimeStepNode> = new Queue<TimeStepNode>();

    // time step tree initialization:
    /*
        The time step tree starts with an initial state
        * then as the tree is made, the next time step is added with its 
        own robot_map
        * Edges are added as the tree is being made
    */
    constructor(robots: any[], location_set: Map<string, [number, number]>, location_to_prop: { [key: string]: string[] } = {}, next_question: Map<string, Array<string>>, initial_question: string) {
        const initialRobotMap = createRobotMap(robots);
        this.location_set = location_set;

        // Create a map from pin coordinates to location names
        for (const [location, pin] of location_set.entries()) {
            this.pin_to_location.set(pin, location);
        }

        this.location_to_prop = location_to_prop;
        this.next_question = next_question || null; // Set the next question if provided, otherwise null
        this.initial_question = initial_question;

        const robotMapCopy = structuredClone(initialRobotMap); // Create a deep copy of the initial robot map

        this.head_time_step = new TimeStepNode({
            id: nanoid(),
            robot_map: robotMapCopy,
            query: initial_question,
            next: [],
        }); // Set the head of the time step tree to the initial state
        this.time_step_queue = new Queue<TimeStepNode>(); // Initialize the time step queue
        this.time_step_queue.enqueue(this.head_time_step); // Enqueue the initial time step
    } 

    countTravelingRobots(robot_map: RobotMap): number {
        let count = 0;
        for (const robot of robot_map.values()) {
            const targetLocation = this.location_set.get(robot.assignedLoc || '');
            if (targetLocation && euclidean_distance(robot.position, targetLocation) > 0.01) {
                count++;
            }
        }
        return count;
    }

    // get known properties based on previous states locations visited
    getKnownProperties(t : TimeStepNode): Set<string> {
        const knownProperties = new Set<string>();
        
        return knownProperties;
    }

    // Idea: through some sort of functionality, the user can click and
    // see the movement of the robots
    updateTimeStep(currentTimeStep: TimeStepNode | undefined, robot_map: RobotMap, visitedLocations_thisStep: Set<string>) {
        // Create deep copy of robot_map
        const robotMapCopy = structuredClone(robot_map);
        
        if(currentTimeStep?.next) {
            if(this.next_question.get(currentTimeStep.query) === undefined) {
                console.error(`No next question found for query: ${currentTimeStep.query}`);
                return null;
            }
            const nextQuestions = structuredClone(this.next_question.get(currentTimeStep.query));
            if (!nextQuestions || nextQuestions.length === 0) {
                console.error(`No next questions found for query: ${currentTimeStep.query}`);
                return null;
            }
            for (const nextQuestion of nextQuestions) 
            {               
                const newVisistedLocations = new Set([...currentTimeStep.visitedLocations, ...visitedLocations_thisStep]);

                for (const loc of newVisistedLocations) {
                    // check if I've been to a location where the property is investigated
                    // this.location_to_prop -> not null
                    // nextQuestion -> not null
                    // this.location_to_prop[loc].includes(nextQuestion) -> if a location has a property (nextQuestion)
                    if(nextQuestion === "true" || nextQuestion === "false") {
                        // If the next question is a terminal state, we do not enqueue it
                        continue;
                    }
                    if (this.location_to_prop[loc] && nextQuestion && this.location_to_prop[loc].includes(nextQuestion)) {
                        // If the next question is already known, skip it
                        // console.log(`Skipping next question ${nextQuestion} for location ${loc} as it is already known.`);
                        // adding more questions based on outcome of the nextQuestion
                        let iteration = 0;
                        for (const prop of this.next_question.get(nextQuestion) || []) {
                            // 
                            if (!nextQuestions.includes(prop)) {
                                // console.log(`Adding new question ${prop} for next questions.`)
                                nextQuestions.push(prop);
                            }
                            iteration++;
                        }
                        continue;
                    } 
                    
                }

                const nextTimeStep = new TimeStepNode({
                    id: nanoid(),
                    robot_map: robotMapCopy,
                    next: [],
                    // property_values: new Map(currentTimeStep.property_values), // Copy the property values from the current time step

                    query: nextQuestion || '',
                });
                // if the two sets (visited) intersect, error
                for (const loc of visitedLocations_thisStep) {
                    if (currentTimeStep.visitedLocations.has(loc)) {
                        console.error(`Location ${loc} has already been visited in the current time step.`);
                        return null;
                    }   
                }

                nextTimeStep.visitedLocations = newVisistedLocations;
                
                
                currentTimeStep.next.push(nextTimeStep);
                if(nextQuestion != "true" && nextQuestion != "false") {
                    // If the next question is a terminal state, we do not enqueue it
                    this.time_step_queue.enqueue(nextTimeStep); 
                }
  
            }
        }
        return null;
    }
 
    // Updates the robot positions incremenetally where
    // the robot with the earliest arrival time reaches its destination
    // then all other robots move towards its goal
    updateRobotPositions(robot_map: RobotMap) {
        // find the robot with the earliest arrival time to destination
        let minimumArrivalTime = Infinity;

        for (const [robotId, robot] of robot_map.entries()) {
            let arrivalTime = robot.time;
            if(robot.assignedLoc) {
                const location_pin = this.location_set.get(robot.assignedLoc);

                const dist = euclidean_distance(location_pin, robot.position);

                if (dist < 0.01) {
                    continue;
                } else if (arrivalTime + dist / robot.velocity < minimumArrivalTime) {
                    arrivalTime = robot.time + dist / robot.velocity;
                    minimumArrivalTime = arrivalTime;
                }
            }
        }

        // update time and position based on earliest arrival time
        

        for (const [robotId, robot] of robot_map.entries()) {
            const time_diff = minimumArrivalTime - robot.time;
            robot.time = minimumArrivalTime;
            // Calculate new position based on movement towards assigned location
            if (robot.assignedLoc) {
                const targetLocation = this.location_set.get(robot.assignedLoc);
                
                if (targetLocation) {
                    const distance = euclidean_distance(robot.position, targetLocation);
                    const maxTravelDistance = robot.velocity * time_diff;
                    const tolerance = 0.01;
                    if (distance < maxTravelDistance) {
                        // Robot is already at the target location or can reach it
                        // within the tolerance
                        robot.position = [targetLocation[0], targetLocation[1]];
                    } 
                    else if (Math.abs(maxTravelDistance - distance) <= tolerance) {
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
                            robot.position[0] + normalizedDirection[0] * maxTravelDistance,
                            robot.position[1] + normalizedDirection[1] * maxTravelDistance
                        ];
                    }
                    // Adding Cost to the robot based on distance
                    robot.cost += distance;

                }
                
            }

        }
    }
    // currently we will only assign robots only when a new query is determined
    assignRobotToLocation(robotId: string, location: string, robot_map: RobotMap) {
        const robot = robot_map.get(robotId);
        if (robot) {
            robot.assignedLoc = location;
        }
        
        // if all robots are assigned updateRobotPositions
        // if (this.available_robots.length === 0) {
        //     while(this.available_robots.length < this.robot_map.size) {
        //         this.updateRobotPositions();
        //     }
        // }
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
   // TODO: 
    generateCombinations(property: string, robot_map: RobotMap, visitedLocations: Set<string>): Array<Map<string, string>> {
        const locations = Array.from(this.location_set.keys());
        const robotIds = Array.from(robot_map.keys());
        const combinations: Array<Map<string, string>> = [];
        
        // Get locations for the specific property
        const propertyLocations = locations.filter(loc => {
            // This would need to be updated based on how property-location mapping is stored
            return this.location_to_prop[loc] && this.location_to_prop[loc].includes(property);
        });
        
        // console.log("Property Locations:", propertyLocations);
        // console.log("Property:", property);
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
                    // console.log("New Used Locations:", newUsedLocations);
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

// Robot Map maps robot id to Robot instance
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

    // updateRobotPositions resolves the assignments


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
            while (robot_manager.countTravelingRobots(robotMap) > 0 && iteration < max_iterations) {
                robot_manager.updateRobotPositions(robotMap);
                iteration++;
            }


            
            
            // Check if robot has reached its destination
            for (const [robotId, robot] of robotMap.entries()) {
                if (robot.assignedLoc) {
                    const targetLocation = robot_manager.location_set.get(robot.assignedLoc);
                    if (targetLocation && euclidean_distance(robot.position, targetLocation) < 0.01) {
                        // Robot has reached its destination, mark it as assigned
                        visitedLocations_thisStep.add(robot.assignedLoc);
                        robot.assignedLoc = null; // Clear the assignment after reaching
                    }
                }
            }
            
            robot_manager.updateTimeStep(currentTimeStep, robotMap, visitedLocations_thisStep);
            robotMap = structuredClone(robotMap_0); // Reset robot map for the next combination
        }
    }
    printTimeSteps(robot_manager); // Print the time steps for debugging
    return robot_manager.head_time_step; // Return the head of the time step tree
}
