import React from 'react';
import { getPropertiesForLocation } from '@/utils/beliefDiagramUtils';

interface LocationsTableProps {
  data: any;
}

export default function LocationsTable({ data }: LocationsTableProps) {
  if (!data?.locations) return null;

  return (
    <table className="locations-table w-full">
      <thead>
        <tr>
          <th className="px-4 py-2 text-left">Loc</th>
          <th className="px-4 py-2 text-left">Pin</th>
          <th className="px-4 py-2 text-left">Prop</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(data.locations).map(([locationId, locationData]: [string, any]) => {
          const properties = getPropertiesForLocation(data, locationId);
          
          return (
            <tr key={locationId}>
              <td className="px-4 py-2">{locationId}</td>
              <td className="px-4 py-2">[{locationData.join(', ')}]</td>
              <td className="px-4 py-2">
                {properties.length > 0 ? properties.join(', ') : 'None'}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
