import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeftIcon, ChevronRightIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface FileManagerProps {
  onFileSelect: (filename: string) => void;
  selectedFile: string | null;
  onFileExport: (fileName: string) => void;
}

interface FileInfo {
  name: string;
  isKartaoFile: boolean;
}

type FileManagerState = 'loading' | 'empty' | 'error' | 'ready';

const FileManager: React.FC<FileManagerProps> = ({ onFileSelect, selectedFile, onFileExport }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [state, setState] = useState<FileManagerState>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const fetchFiles = async () => {
    setState('loading');
    try {
      const response = await axios.get<string[]>('/api/files');
      const fileInfos = response.data
        .filter(file => file.endsWith('.json'))
        .map(file => ({
          name: file,
          isKartaoFile: false // Will be validated when selected
        }));
      setFiles(fileInfos);
      setState(fileInfos.length === 0 ? 'empty' : 'ready');
    } catch (err: any) {
      setState('error');
      if (err.response) {
        switch (err.response.status) {
          case 403:
            setErrorMessage('Permission denied: Cannot access the DATA folder');
            break;
          case 404:
            setErrorMessage('DATA folder not found: Please check your volume mapping');
            break;
          default:
            setErrorMessage(`Error: ${err.response.data?.message || 'Failed to fetch files'}`);
        }
      } else if (err.request) {
        setErrorMessage('Network error: Cannot connect to the server');
      } else {
        setErrorMessage('Error: Failed to fetch files');
      }
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileSelect = async (fileName: string) => {
    try {
      const response = await axios.get(`/api/validate/${fileName}`);
      if (response.data.isValid) {
        onFileSelect(fileName);
      } else {
        alert('This is not a valid Kartao project file.');
      }
    } catch (err) {
      alert('Failed to validate file. It may not be a Kartao project file.');
    }
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        
        try {
          await axios.post('/api/import', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          fetchFiles();
        } catch (err) {
          alert('Failed to import file');
        }
      }
    };
    
    input.click();
  };

  const handleExport = () => {
    if (selectedFile) {
      onFileExport(selectedFile);
    }
  };

  const renderFileList = () => {
    switch (state) {
      case 'loading':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nord-7"></div>
          </div>
        );
      case 'empty':
        return (
          <div className="text-center text-nord-4 p-4">
            The DATA folder is empty. Import a Kartao project file to get started.
          </div>
        );
      case 'error':
        return (
          <div className="text-center text-nord-11 p-4">
            {errorMessage}
          </div>
        );
      case 'ready':
        return (
          <div className="space-y-1">
            {files.map((file) => (
              <div
                key={file.name}
                onClick={() => handleFileSelect(file.name)}
                className={`p-2 rounded cursor-pointer hover:bg-nord-2 ${
                  selectedFile === file.name ? 'bg-nord-3' : ''
                }`}
              >
                {file.name}
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className={`bg-nord-1 h-screen transition-all duration-300 ${isMinimized ? 'w-12' : 'w-1/3'}`}>
      <div className="flex items-center justify-between p-4 border-b border-nord-3">
        {!isMinimized && (
          <>
            <h2 className="text-xl font-semibold text-nord-6">File Manager</h2>
            <button
              onClick={fetchFiles}
              className="p-1 rounded hover:opacity-80"
              title="Reload files"
            >
              <ArrowPathIcon className="w-5 h-5 text-[#fa9237]" />
            </button>
          </>
        )}
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="p-1 rounded hover:opacity-80"
        >
          {isMinimized ? (
            <ChevronRightIcon className="w-6 h-6 text-[#fa9237]" />
          ) : (
            <ChevronLeftIcon className="w-6 h-6 text-[#fa9237]" />
          )}
        </button>
      </div>

      {!isMinimized && (
        <>
          <div className="flex justify-center p-4">
            <div className="w-4/5 bg-nord-2 rounded-lg h-[60vh] overflow-y-auto">
              {renderFileList()}
            </div>
          </div>

          <div className="absolute bottom-0 w-1/3 p-4 border-t border-nord-3 bg-nord-1">
            <div className="flex gap-2">
              <button
                onClick={handleImport}
                className="flex-1 bg-nord-7 text-white px-4 py-2 rounded hover:bg-nord-8"
              >
                Import
              </button>
              <button
                onClick={handleExport}
                disabled={!selectedFile}
                className={`flex-1 px-4 py-2 rounded ${
                  selectedFile
                    ? 'bg-nord-7 text-white hover:bg-nord-8'
                    : 'bg-nord-3 text-nord-4 cursor-not-allowed'
                }`}
              >
                Export
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FileManager; 