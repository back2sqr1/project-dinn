import { Digraph, Node, Edge, toDot } from 'ts-graphviz';
import { Queue } from '@/utils/Queue';
import { create } from 'domain';



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
    const location_to_prop: { [key: string]: string } = {};
    for (const [prop, locations] of Object.entries(prop_to_location)) {
        for (const location of locations as string[]) {
            if (!location_to_prop[location]) {
                location_to_prop[location] = "";
            }
            location_to_prop[location] = prop;
        }
    }
    return location_to_prop;
}

class Robot {
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
        time = 0
    }: {
        id: string;
        velocity?: number;
        position?: [number, number];
        assignedLoc?: string | null;
        time?: number;
    }) {
        this.id = id;
        this.velocity = velocity;
        this.position = position;
        this.assignedLoc = assignedLoc;
        this.time = time;
        this.cost = 0;
    }

    toString(): string {
        return `Robot[id=${this.id}, velocity=${this.velocity}, position=[${this.position[0]}, ${this.position[1]}], assignedLoc=${this.assignedLoc}, time=${this.time}, cost=${this.cost}]`;
    }

}

class RobotManager {
    robot_map: Map<string, Robot>;
    available_robots: string[];
    location_set : Map<string, [number, number]>;


    // Persistency on states
    time_steps: Array<[Map<string, Robot>, string[]]> = [];

    constructor(robots: any[], location_set: Map<string, [number, number]>) {
        this.robot_map = createRobotMap(robots);
        this.available_robots = Array.from(this.robot_map.keys());
        this.location_set = location_set;
        this.updateTimeStep();
    } 


    // Updates robotMap to preserve robot positions
    // Idea: through some sort of functionality, the user can click and
    // see the movement of the robots
    updateTimeStep() {
        // Create deep copy of robot_map
        const robotMapCopy = structuredClone(this.robot_map);
        // deep copy of available_robots
        const availableRobotsCopy = structuredClone(this.available_robots);
        // Store the initial state
        this.time_steps.push([robotMapCopy, availableRobotsCopy]);

    }
 
    // Updates the robot positions incremenetally where
    // the robot with the earliest arrival time reaches its destination
    // then all other robots move towards its goal
    updateRobotPositions() {
        // find the robot with the earliest arrival time to destination
        let minimumArrivalTime = Infinity;

        for (const [robotId, robot] of this.robot_map.entries()) {
            let arrivalTime = robot.time;
            if(robot.assignedLoc) {
                const location_pin = this.location_set.get(robot.assignedLoc);

                arrivalTime += euclidean_distance(location_pin, robot.position) / robot.velocity;

                if (arrivalTime < minimumArrivalTime) {
                    minimumArrivalTime = arrivalTime;
                }
            }
        }

        // update time and position based on earliest arrival time

        for (const [robotId, robot] of this.robot_map.entries()) {
            const time_diff = minimumArrivalTime - robot.time;
            robot.time = minimumArrivalTime;
            // Calculate new position based on movement towards assigned location
            if (robot.assignedLoc) {
                const targetLocation = this.location_set.get(robot.assignedLoc);
                if (targetLocation) {
                    const distance = euclidean_distance(robot.position, targetLocation);
                    const maxTravelDistance = robot.velocity * time_diff;
                    
                    if (maxTravelDistance >= distance) {
                        // Robot reaches the target location
                        robot.position = [targetLocation[0], targetLocation[1]];
                        this.available_robots.push(robotId);
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
        this.updateTimeStep();


    }
    // currently we will only assign robots only when a new query is determined
    assignRobotToLocation(robotId: string, location: string) {
        const robot = this.robot_map.get(robotId);
        if (robot) {
            robot.assignedLoc = location;
            this.available_robots = this.available_robots.filter(id => id !== robotId);
        }
        // if all robots are assigned updateRobotPositions
        if (this.available_robots.length === 0) {
            while(this.available_robots.length < this.robot_map.size) {
                this.updateRobotPositions();
            }
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
   // TODO
    generateCombinations(property: string): Array<Map<string, string>> {
        const prop_to_location = this.location_set; // Assuming this contains property to location mapping
        const locations = Array.from(this.location_set.keys());
        const robotIds = Array.from(this.robot_map.keys());
        const combinations: Array<Map<string, string>> = [];
        
        // Get locations for the specific property
        const propertyLocations = locations.filter(loc => {
            // This would need to be updated based on how property-location mapping is stored
            return true; // Placeholder - you'll need to implement property-location filtering
        });
        
        if (propertyLocations.length === 0) {
            return combinations;
        }
        
        // Generate all possible assignments
        function generateAssignments(robotIndex: number, currentAssignment: Map<string, string>, usedLocations: Set<string>) {
            if (robotIndex === robotIds.length) {
                // Check if at least one robot is assigned to a property location
                const hasPropertyAssignment = Array.from(currentAssignment.values()).some(loc => 
                    propertyLocations.includes(loc)
                );
                if (hasPropertyAssignment) {
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
        
        generateAssignments(0, new Map(), new Set());
        return combinations;
    }

}

// Robot Map maps robot id to Robot instance
function createRobotMap(robots: any[]): Map<string, Robot> {
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

export default function search(parsedData : any, robots: any): any {
    if (!parsedData || !robots) {
        return null;
    }
    const locations = location_set(parsedData);
    const props = properties_set(parsedData);
    const prop_to_location = parsedData.prop_to_location || {};
    const location_to_prop = _location_to_prop(prop_to_location);
    const starting_prop = parsedData.starting_prop || "p";
    const next_query = parsedData.edges;

    const robot_manager = new RobotManager(robots, locations);

    // 1. go to the first prop
    // in order to do so, you must choose a location, 
    for (const loc of prop_to_location[starting_prop] || []) {
        // loc is a letter id like "a"
        if (!locations.has(loc)) {
            console.error(`Location ${loc} not found in parsed data.`);
            continue;
        }

        const pin = locations.get(loc);
        // with this pin, you must select a robot to go there

        for (const robot of robots) {
            
        }
    }
    console.log(robot_manager);




}
