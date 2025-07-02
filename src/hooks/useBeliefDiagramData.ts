import { useState, useEffect } from 'react';

/**
 * Custom hook for managing belief diagram data with localStorage persistence
 */
export function useBeliefDiagramData(initialData: any) {
  const [parsedData, setParsedData] = useState<string>('');

  // Load saved data on mount
  useEffect(() => {
    const savedParsedData = localStorage.getItem('parsedData');
    if (savedParsedData) {
      const parsedDataObj = JSON.parse(savedParsedData);
      setParsedData(JSON.stringify(parsedDataObj, null, 2));
    } else {
      setParsedData(JSON.stringify(initialData, null, 2));
    }
  }, [initialData]);

  // Save data when it changes
  useEffect(() => {
    if (parsedData) {
      localStorage.setItem('parsedData', parsedData);
    }
  }, [parsedData]);

  const updateData = (newData: any) => {
    setParsedData(JSON.stringify(newData, null, 2));
  };

  const getParsedObject = () => {
    try {
      return JSON.parse(parsedData);
    } catch {
      return null;
    }
  };

  return {
    parsedData,
    setParsedData,
    updateData,
    getParsedObject
  };
}
