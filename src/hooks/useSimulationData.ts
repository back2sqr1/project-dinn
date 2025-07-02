import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing local storage data
 */
export function useLocalStorageData() {
  const [parsedData, setParsedData] = useState<any>(null);
  const [robots, setRobots] = useState<any[]>([]);

  useEffect(() => {
    const savedParsedData = localStorage.getItem('parsedData');
    if (savedParsedData) {
      const parsedDataObj = JSON.parse(savedParsedData);
      setParsedData(parsedDataObj);
    }

    const savedRobots = localStorage.getItem('robots');
    if (savedRobots) {
      setRobots(JSON.parse(savedRobots));
    } else {
      alert("No robots found in local storage. Please set the robot parameters first.");
      window.location.href = '/belief-graph';
    }
  }, []);

  return { parsedData, robots };
}

/**
 * Custom hook for managing search and tree state
 */
export function useSearchTree() {
  const [selectedRobotMap, setSelectedRobotMap] = useState<Map<string, any> | null>(null);

  const handleNodeSelect = useCallback((robotMap: Map<string, any>) => {
    setSelectedRobotMap(robotMap);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedRobotMap(null);
  }, []);

  return {
    selectedRobotMap,
    handleNodeSelect,
    clearSelection
  };
}
