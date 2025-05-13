import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import fs from 'fs-extra';
import path from 'path';

const app = express();
const port = process.env.PORT || 5043;

// Middleware
app.use(cors());
app.use(express.json());

// Constants
const DATA_DIR = process.env.NODE_ENV === 'production' 
  ? (process.env.DATA_DIR || '/app/data')
  : path.join(__dirname, '../../../../Kartao/kartao/volumes/data');
const DEFAULT_COLUMNS = (process.env.DEFAULT_COLUMNS || 'Backlog,To Do,In Progress,Testing,Completed').split(',');

console.log('Data directory path:', DATA_DIR);
console.log('Current directory:', __dirname);

// Types
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

// Ensure data directory exists
fs.ensureDirSync(DATA_DIR);

// Helper function to validate board structure
const validateBoard = (board: unknown): board is Board => {
  if (!board || typeof board !== 'object') return false;
  const b = board as Board;
  if (!Array.isArray(b.columns)) return false;
  
  return b.columns.every((column: unknown) => {
    if (!column || typeof column !== 'object') return false;
    const c = column as Column;
    return typeof c.id === 'string' && 
           typeof c.name === 'string' && 
           Array.isArray(c.cards);
  });
};

// Routes
app.get('/api/boards', async (req: Request, res: Response) => {
  try {
    console.log('Attempting to read directory:', DATA_DIR);
    const files = await fs.readdir(DATA_DIR);
    console.log('Files found:', files);
    
    const boards = await Promise.all(
      files
        .filter((file: string) => file.endsWith('.json'))
        .map(async (file: string) => {
          const filePath = path.join(DATA_DIR, file);
          console.log('Reading file:', filePath);
          const content = await fs.readFile(filePath, 'utf-8');
          return JSON.parse(content) as Board;
        })
    );
    res.json(boards);
  } catch (error) {
    console.error('Error reading boards:', error);
    res.status(500).json({ error: 'Failed to read boards' });
  }
});

app.post('/api/boards', async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Board name is required' });
    }

    const board: Board = {
      name,
      columns: DEFAULT_COLUMNS.map((colName: string, index: number) => ({
        id: `col-${index}`,
        name: colName,
        cards: []
      }))
    };

    const fileName = `${name.toLowerCase().replace(/\s+/g, '-')}.json`;
    await fs.writeFile(
      path.join(DATA_DIR, fileName),
      JSON.stringify(board, null, 2)
    );

    res.status(201).json(board);
  } catch (error) {
    console.error('Error creating board:', error);
    res.status(500).json({ error: 'Failed to create board' });
  }
});

app.put('/api/boards/:fileName', async (req: Request, res: Response) => {
  try {
    const { fileName } = req.params;
    const board = req.body;

    if (!validateBoard(board)) {
      return res.status(400).json({ error: 'Invalid board structure' });
    }

    await fs.writeFile(
      path.join(DATA_DIR, fileName),
      JSON.stringify(board, null, 2)
    );

    res.json(board);
  } catch (error) {
    console.error('Error updating board:', error);
    res.status(500).json({ error: 'Failed to update board' });
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 