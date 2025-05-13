import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { XMarkIcon } from '@heroicons/react/24/outline';

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

interface KanbanBoardProps {
  board: Board | null;
  onDragEnd: (result: DropResult) => void;
  onClose: () => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ board, onDragEnd, onClose }) => {
  if (!board) return null;

  return (
    <div className="flex-1 h-screen bg-nord-0 relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 hover:bg-nord-2 rounded-full"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>

      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8">{board.name}</h1>
        
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {board.columns.map((column) => (
              <div
                key={column.id}
                className="flex-shrink-0 w-80 bg-nord-1 rounded-lg p-4"
              >
                <h2 className="text-xl font-semibold mb-4">{column.name}</h2>
                <Droppable droppableId={column.id}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-2"
                    >
                      {column.cards.map((card, index) => (
                        <Draggable
                          key={card.id}
                          draggableId={card.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-nord-2 p-3 rounded shadow"
                            >
                              <h3 className="font-medium">{card.title}</h3>
                              <p className="text-sm text-nord-4">{card.description}</p>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

export default KanbanBoard; 