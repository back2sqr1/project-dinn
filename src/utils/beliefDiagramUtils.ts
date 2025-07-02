/**
 * Default belief diagram data structure
 */
export const DEFAULT_BELIEF_DIAGRAM = {
  "size": [50, 10],
  "starting_prop": "p",
  "props": [
    "p",
    "p'",
    "p''",
    "p'''",
    "p'''",
  ],
  "locations": {
    "a": [5, 5],
    "b": [30, 7],
    "c": [15, 5],
    "d": [0, 0],
    "e": [10, 10]
  },
  "edges": {
    "p": ["p'", "p'''"],
    "p'": ["p'''", "p''"],
    "p''": ["true", "false"],
    "p'''": ["p''", "false"]
  },
  "prop_to_location": {
    "p": ["a"],
    "p'": ["b", "e"],
    "p''": ["b", "d", "e"],
    "p'''": ["d"]
  }
};

/**
 * Validates if a belief diagram object has required structure
 */
export function validateBeliefDiagram(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  
  const requiredFields = ['size', 'starting_prop', 'props', 'locations', 'edges', 'prop_to_location'];
  return requiredFields.every(field => field in data);
}

/**
 * Gets properties associated with a location
 */
export function getPropertiesForLocation(data: any, locationId: string): string[] {
  if (!data.prop_to_location) return [];
  
  return Object.entries(data.prop_to_location)
    .filter(([, locations]) => Array.isArray(locations) && locations.includes(locationId))
    .map(([prop]) => prop);
}
