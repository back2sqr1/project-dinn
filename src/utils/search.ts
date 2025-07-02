import { nanoid } from 'nanoid';
import { euclidean_distance, _location_to_pin, _location_to_prop, properties_set } from './props_and_locations';
import { TimeStepNode } from '@/utils/TimeStepNode';
import { RobotManager } from '@/utils/RobotManager';
import { Robot } from './Robot';

// Types for better type safety
interface ParsedData {
  locations: Record<string, [number, number]>;
  prop_to_location: Record<string, string[]>;
  starting_prop: string;
  edges: Record<string, string[]>;
  props: string[];
}

interface LocationMaps {
  locationToPin: Map<string, [number, number]>;
  pinToLocation: Map<[number, number], string>;
  locationToProp: Record<string, string[]>;
}

// Constants
const DISTANCE_THRESHOLD = 0.01;

// Exported maps for backward compatibility
export let location_to_pin: Map<string, [number, number]> = new Map();
export const pin_to_location: Map<[number, number], string> = new Map();
export let location_to_prop: { [key: string]: string[] } = {};

/**
 * Initializes location mapping from parsed data
 */
function initializeLocationMaps(parsedData: ParsedData): LocationMaps {
  const locationToPin = _location_to_pin(parsedData);
  const locationToProp = _location_to_prop(parsedData.prop_to_location || {});
  const pinToLocation = new Map<[number, number], string>();

  // Populate reverse mapping
  for (const [location, pin] of locationToPin.entries()) {
    pinToLocation.set(pin, location);
  }

  // Update global maps for backward compatibility
  location_to_pin = locationToPin;
  location_to_prop = locationToProp;
  pin_to_location.clear();
  for (const [pin, location] of pinToLocation.entries()) {
    pin_to_location.set(pin, location);
  }

  return { locationToPin, pinToLocation, locationToProp };
}

/**
 * Creates a new TimeStepNode with common properties
 */
function createTimeStepNode(
  robotMap: Map<string, Robot>,
  query: string,
  type: 'Query' | 'Robot Assignment' | 'Robot Moving',
  resolvedQuestions: Map<string, string>,
  visitedLocations: Set<string>
): TimeStepNode {
  const node = new TimeStepNode({
    id: nanoid(),
    robot_map: structuredClone(robotMap),
    query,
    next: [],
    type,
    resolvedQuestions: structuredClone(resolvedQuestions)
  });
  node.visitedLocations = new Set([...visitedLocations]);
  return node;
}

/**
 * Checks if robots have reached their destinations and returns visited locations
 */
function checkRobotDestinations(
  robotMap: Map<string, Robot>,
  locationToPin: Map<string, [number, number]>
): Set<string> {
  const visitedLocations = new Set<string>();

  for (const [, robot] of robotMap.entries()) {
    if (robot.assignedLoc) {
      const targetLocation = locationToPin.get(robot.assignedLoc);
      if (targetLocation && euclidean_distance(robot.position, targetLocation) < DISTANCE_THRESHOLD) {
        visitedLocations.add(robot.assignedLoc);
      }
    }
  }

  return visitedLocations;
}

/**
 * Processes robot movement and creates necessary nodes
 */
function processRobotMovement(
  robotManager: RobotManager,
  robotMap: Map<string, Robot>,
  currentNode: TimeStepNode,
  locationToPin: Map<string, [number, number]>,
  allowWaiting: boolean
): TimeStepNode {
  let curNode = currentNode;

  while (robotManager.countTravelingRobots(robotMap) > 0) {
    robotManager.updateRobotPositions(robotMap);
    
    const robotMovingNode = createTimeStepNode(
      robotMap,
      curNode.query,
      'Robot Moving',
      curNode.resolvedQuestions,
      curNode.visitedLocations
    );

    if (allowWaiting) {
      curNode.next = curNode.next || [];
      curNode.next.push(robotMovingNode);
      curNode = robotMovingNode;
    }

    const visitedLocations = checkRobotDestinations(robotMap, locationToPin);
    
    const queryNode = createTimeStepNode(
      robotMap,
      curNode.query,
      'Query',
      curNode.resolvedQuestions,
      curNode.visitedLocations
    );

    if (allowWaiting || curNode.type === "Robot Assignment") {
      curNode.next = curNode.next || [];
      curNode.next.push(queryNode);
      curNode = queryNode;
      robotManager.updateTimeStep(curNode, visitedLocations);
    }
  }

  return curNode;
}

/**
 * Processes a single robot combination
 */
function processCombination(
  combination: Map<string, string>,
  robotManager: RobotManager,
  currentTimeStep: TimeStepNode,
  robotMapOriginal: Map<string, Robot>,
  locationToPin: Map<string, [number, number]>,
  allowWaiting: boolean
): void {
  const robotMap = structuredClone(robotMapOriginal);

  // Assign robots to locations
  for (const [robotId, location] of combination.entries()) {
    robotManager.assignRobotToLocation(robotId, location, robotMap);
  }

  processRobotMovement(robotManager, robotMap, currentTimeStep, locationToPin, allowWaiting);
}

/**
 * Main search algorithm that processes robot assignments and movements
 * 
 * Strategy:
 * 1. Generate all combinations of robot assignments to locations for the starting property
 * 2. For each combination, assign robots to locations
 * 3. Update robot positions based on the earliest arrival time (allow robots to wait)
 * 
 * @param parsedData - The parsed data containing locations, properties, and edges
 * @param robots - Map of robot IDs to Robot objects
 * @param allowWaiting - Whether robots can wait during movement
 * @returns The head of the time step tree or null if invalid input
 */
export default function search(
  parsedData: ParsedData | any, 
  robots: Map<string, Robot>, 
  allowWaiting: boolean = true
): TimeStepNode | null {
  // Input validation
  if (!parsedData || !robots || robots.size === 0) {
    return null;
  }

  // Initialize location mappings
  const { locationToPin } = initializeLocationMaps(parsedData);
  
  // Extract required properties
  const props = properties_set(parsedData);
  const startingProp = parsedData.starting_prop || "p";
  const nextQuery = new Map<string, string[]>(Object.entries(parsedData.edges || {}));

  // Initialize robot manager
  const robotManager = new RobotManager(robots, nextQuery, startingProp, props);
  robotManager.allowWaiting = allowWaiting;

  // Process all time steps
  while (robotManager.time_step_queue.size() > 0) {
    const currentTimeStep = robotManager.time_step_queue.dequeue();
    
    if (!currentTimeStep?.robot_map) {
      console.error("No robot map found in the current time step.");
      continue;
    }

    const originalRobotMap = currentTimeStep.robot_map;
    const combinations = robotManager.generateCombinations(
      currentTimeStep.query, 
      originalRobotMap, 
      currentTimeStep.visitedLocations
    );

    // Process each combination
    for (const combination of combinations) {
      processCombination(
        combination,
        robotManager,
        currentTimeStep,
        originalRobotMap,
        locationToPin,
        allowWaiting
      );
    }
  }

  return robotManager.head_time_step;
}
