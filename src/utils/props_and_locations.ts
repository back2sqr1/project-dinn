export function euclidean_distance(location_a: any, location_b: any): number {
    return Math.sqrt(
        Math.pow(location_a[0] - location_b[0], 2) +
        Math.pow(location_a[1] - location_b[1], 2)
    );
}

export function _location_to_pin(parsedData: any) : Map<string, [number, number]> {
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

export function properties_set(parsedData: any) : Array<string> {
    const properties: Array<string> = [];
    for (const [key, value] of Object.entries(parsedData.props)) {
        if (value && typeof value === 'string') {
            properties.push(value);
        }
    }
    return properties;
}

export function _location_to_prop(prop_to_location: any) {
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