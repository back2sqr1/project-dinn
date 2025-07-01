# Project Dinn - Belief Diagram Search Visualization

A Next.js application for visualizing and searching through belief diagrams with robot path planning capabilities.

## Getting Started

### Input JSON Format

The application expects a belief diagram in the following JSON format:

#### Basic Structure

```json
{
    "author": "David Zhang",
    "size" : [50, 10],
    "starting_prop": "p",

    "props" : [
        "p",
        "p'",
        "p''",
        "p'''",
        "p'''"
    ],
    

    "locations" : {
        "a" : [5, 5],
        "b" : [30, 7],
        "c" : [16, 5],
        "d" : [0, 0],
        "e" : [10, 10]
    },
    "edges" : {
        "p" : ["p'", "p'''"],
        "p'" : ["p'''", "p''"],
        "p''" : ["true", "false"],
        "p'''": ["p''", "false"]
    },

    "prop_to_location" : {
        "p" : ["a"],
        "p'" : ["b", "e"],
        "p''" : ["b", "d", "e"],
        "p'''": ["d"]
    }
}
```

#### Field Descriptions

- **author**: String identifying the creator of the belief diagram
- **size**: Array `[width, height]` defining the canvas dimensions for visualization
- **starting_prop**: String specifying the initial proposition node where traversal begins
- **props**: Array of strings listing all proposition identifiers in the diagram
- **locations**: Object mapping location identifiers to coordinate pairs `[x, y]`
- **edges**: Object defining the graph structure where each proposition maps to an array of connected propositions
- **prop_to_location**: Object associating each proposition with an array of location identifiers where it can be found