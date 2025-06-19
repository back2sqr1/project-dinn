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

    updateTime() {
        // if all robots are assigned to a location, then update the time accordingly

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
        // Create deep copy of robot_map
        const robotMapCopy = structuredClone(this.robot_map);
        // deep copy of available_robots
        const availableRobotsCopy = structuredClone(this.available_robots);
        // Store the initial state
        this.time_steps.push([robotMapCopy, availableRobotsCopy]);
        this.location_set = location_set;
    }

    update() {
        // find the robot with the earliest arrival time to destination
        let minimumArrivalTime = Infinity;

        for (const [robotId, robot] of this.robot_map.entries()) {
            let arrivalTime = robot.time;
            const location_pin = this.location_set.get(robot.assignedLoc || "");

            arrivalTime += euclidean_distance(location_pin, robot.position) / robot.velocity;

            if (arrivalTime < minimumArrivalTime) {
                minimumArrivalTime = arrivalTime;
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

    }

    assignRobotToLocation(robotId: string, location: string) {
        const robot = this.robot_map.get(robotId);
        if (robot) {
            robot.assignedLoc = location;
            this.available_robots = this.available_robots.filter(id => id !== robotId);
        } else {
            this.update();
        }
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


}
