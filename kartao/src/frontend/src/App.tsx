import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DropResult } from 'react-beautiful-dnd';
import FileManager from './components/FileManager';
import KanbanBoard from './components/KanbanBoard';

interface Card {
  id: string;
  title: string;
  description: string;
}

interface Column {
  id: string;
  name: string;
  cards: Card[];
}

interface Board {
  name: string;
  columns: Column[];
}

const App: React.FC = () => {
  const [board, setBoard] = useState<Board | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !board) return;

    const { source, destination } = result;
    const sourceColumn = board.columns.find(col => col.id === source.droppableId);
    const destColumn = board.columns.find(col => col.id === destination.droppableId);

    if (!sourceColumn || !destColumn) return;

    const newColumns = [...board.columns];
    const sourceCards = [...sourceColumn.cards];
    const [movedCard] = sourceCards.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      sourceCards.splice(destination.index, 0, movedCard);
      const columnIndex = newColumns.findIndex(col => col.id === source.droppableId);
      newColumns[columnIndex] = { ...sourceColumn, cards: sourceCards };
    } else {
      const destCards = [...destColumn.cards];
      destCards.splice(destination.index, 0, movedCard);
      const sourceColumnIndex = newColumns.findIndex(col => col.id === source.droppableId);
      const destColumnIndex = newColumns.findIndex(col => col.id === destination.droppableId);
      newColumns[sourceColumnIndex] = { ...sourceColumn, cards: sourceCards };
      newColumns[destColumnIndex] = { ...destColumn, cards: destCards };
    }

    setBoard({ ...board, columns: newColumns });

    try {
      await axios.put(`/api/boards/${selectedFile}`, { ...board, columns: newColumns });
    } catch (error) {
      console.error('Error updating board:', error);
    }
  };

  const handleFileSelect = async (filename: string) => {
    try {
      const response = await axios.get(`/api/boards/${filename}`);
      setBoard(response.data);
      setSelectedFile(filename);
    } catch (error) {
      console.error('Error loading board:', error);
    }
  };

  const handleFileExport = async (filename: string) => {
    try {
      const response = await axios.get(`/api/boards/${filename}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting file:', error);
      alert('Failed to export file');
    }
  };

  const handleCloseBoard = () => {
    setBoard(null);
    setSelectedFile(null);
  };

  return (
    <div className="flex h-screen bg-nord-0">
      <FileManager
        onFileSelect={handleFileSelect}
        selectedFile={selectedFile}
        onFileExport={handleFileExport}
      />
      <KanbanBoard
        board={board}
        onDragEnd={handleDragEnd}
        onClose={handleCloseBoard}
      />
    </div>
  );
};

export default App; 