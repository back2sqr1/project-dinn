import React from 'react';

interface FileUploaderProps {
  onFileLoad: (data: any) => void;
  onError: (error: string) => void;
  accept?: string;
  className?: string;
}

export default function FileUploader({ 
  onFileLoad, 
  onError, 
  accept = ".json",
  className = "file-input" 
}: FileUploaderProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        const parsedData = JSON.parse(content);
        onFileLoad(parsedData);
      } catch (error) {
        onError('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <input 
      className={className}
      type="file" 
      accept={accept}
      onChange={handleFileChange} 
    />
  );
}
